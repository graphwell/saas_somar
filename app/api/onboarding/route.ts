import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface OnboardingBody {
  businessName: string;
  segment: string;
  location: string;
  agentName: string;
  agentTone: 'formal' | 'friendly' | 'neutral';
  agentServices: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body: OnboardingBody = await req.json();

    const { businessName, segment, location, agentName, agentTone, agentServices } = body;

    if (!businessName?.trim() || !agentName?.trim()) {
      return NextResponse.json({ error: 'Nome do negócio e da IA são obrigatórios.' }, { status: 400 });
    }

    // Verificar se o usuário já tem um agente configurado
    const existingAgent = await prisma.agent.findFirst({
      where: { userId },
    });

    const agentConfig = {
      segment: segment || '',
      location: location || '',
      businessName: businessName.trim(),
      services: agentServices || '',
      tone: agentTone || 'neutral',
    };

    if (existingAgent) {
      // Atualizar agente existente
      await prisma.agent.update({
        where: { id: existingAgent.id },
        data: {
          nomeAgente: agentName.trim(),
          configuracao: agentConfig,
        },
      });
    } else {
      // Criar novo agente
      await prisma.agent.create({
        data: {
          userId,
          nomeAgente: agentName.trim(),
          configuracao: agentConfig,
          ativo: false, // inativo até conectar WhatsApp
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('ONBOARDING_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno ao salvar onboarding.' }, { status: 500 });
  }
}
