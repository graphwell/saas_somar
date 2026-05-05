import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InstancePlan } from '@prisma/client';

export async function GET(request: Request) {
  // Proteção básica para garantir que a chamada venha do sistema (Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Reseta o contador de todas as instâncias TRIAL
    const result = await prisma.whatsAppInstance.updateMany({
      where: { 
        plan: InstancePlan.TRIAL 
      },
      data: { 
        messageCount: 0 
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      resetAt: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[CRON_RESET_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao resetar contadores' }, { status: 500 });
  }
}
