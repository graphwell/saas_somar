import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Validação de segurança simples (N8N secret)
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET || 'somar-n8n-secret-2026';
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader !== `Bearer ${n8nSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { agentId, query, response, tokensUsed, userId } = body;

    if (!agentId || !query || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Save Semantic Cache (Q&A)
    const normalizedQuery = query.toLowerCase().trim();
    await prisma.agentResponseCache.create({
      data: {
        agentId,
        query: normalizedQuery,
        response
      }
    });

    // 3. Update Token Usage
    if (userId && tokensUsed) {
      await prisma.subscription.update({
        where: { userId },
        data: { tokensUsed: { increment: parseInt(tokensUsed) } }
      });
    }

    return NextResponse.json({ success: true, message: 'Cache updated and tokens logged' });

  } catch (error) {
    console.error('N8N_CALLBACK_ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
