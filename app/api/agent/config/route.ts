import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const config = await prisma.agent.findFirst({
      where: { userId }
    });

    if (!config) {
        return NextResponse.json({});
    }

    return NextResponse.json({
        prompt: config.systemPrompt,
        temperature: config.temperature,
        name: config.name
    });
  } catch (error) {
    console.error('AGENT_CONFIG_GET_ERROR:', error);
    return NextResponse.json({ error: 'Erro ao buscar configuração' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { prompt, temperature, settingsJson, targetUserId } = body;
    const name = settingsJson?.agentName || 'Assistente Virtual';

    const isAdmin = (session.user as any).role === 'ADMIN';
    const targetId = (isAdmin && targetUserId) ? targetUserId : userId;
    const editedByText = (isAdmin && targetUserId) ? `ADMIN - ${(session.user as any).name || 'Suporte'}` : 'USER';

    // Procura o primeiro agente
    const existingAgent = await prisma.agent.findFirst({ where: { userId: targetId } });

    let config;
    if (existingAgent) {
        config = await prisma.agent.update({
            where: { id: existingAgent.id },
            data: {
                systemPrompt: prompt || '',
                temperature: parseFloat(temperature) || 0.7,
                name: name,
                lastEditedBy: editedByText,
                lastEditedAt: new Date()
            }
        });
    } else {
        config = await prisma.agent.create({
            data: {
                userId: targetId,
                systemPrompt: prompt || '',
                temperature: parseFloat(temperature) || 0.7,
                name: name,
                lastEditedBy: editedByText,
                lastEditedAt: new Date()
            }
        });
    }

    // Criar o log de auditoria
    await prisma.agentAuditLog.create({
        data: {
            agentId: config.id,
            editedBy: editedByText,
            action: 'UPDATE_CONFIG'
        }
    });

    return NextResponse.json({
        prompt: config.systemPrompt,
        temperature: config.temperature,
        name: config.name
    });
  } catch (error) {
    console.error('AGENT_CONFIG_POST_ERROR:', error);
    return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
  }
}
