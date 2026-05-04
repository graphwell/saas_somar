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

    const systemPrompt = `Você é ${agentName.trim()}, um assistente virtual para ${businessName.trim()}.
Segmento: ${segment || 'Não especificado'}
Localização: ${location || 'Não especificada'}
Tom de voz: ${agentTone || 'neutral'}
Serviços: ${agentServices || 'Não especificados'}`;

    if (existingAgent) {
      // Atualizar agente existente
      await prisma.agent.update({
        where: { id: existingAgent.id },
        data: {
          name: agentName.trim(),
          systemPrompt: systemPrompt,
        },
      });
    } else {
      // Criar novo agente
      await prisma.agent.create({
        data: {
          userId,
          name: agentName.trim(),
          systemPrompt: systemPrompt,
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('ONBOARDING_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno ao salvar onboarding.' }, { status: 500 });
  }
}
