import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Cadastro de novos usuários com atribuição de instância automática do pool

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, senha } = body;

    if (typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string') {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const nomeTrimmed = nome.trim();
    const emailTrimmed = email.trim().toLowerCase();

    if (!nomeTrimmed || !emailTrimmed || !senha) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }
    if (nomeTrimmed.length < 2 || nomeTrimmed.length > 100) {
      return NextResponse.json({ error: 'Nome deve ter entre 2 e 100 caracteres.' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(emailTrimmed)) {
      return NextResponse.json({ error: 'Endereço de e-mail inválido.' }, { status: 400 });
    }
    if (senha.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
    }
    if (senha.length > 72) {
      return NextResponse.json({ error: 'A senha deve ter no máximo 72 caracteres.' }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { email: emailTrimmed } });
    if (userExists) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(senha, 12);

    // 1. Criar Usuário + Agente padrão + Assinatura Trial (atômico)
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: nomeTrimmed,
          email: emailTrimmed,
          password: hashedPassword,
          role: 'USER',
          agents: {
            create: {
              name: 'Atendente Padrão',
              systemPrompt: `Você é uma assistente virtual profissional chamada "Assistente Somar.IA". Responda de forma educada e eficiente para os clientes da empresa ${nomeTrimmed}.`,
              temperature: 0.7,
            },
          },
        },
      });

      await tx.subscription.create({
        data: {
          userId: newUser.id,
          planType: 'trial',
          status: 'active',
          messagesLimit: 100,
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias trial
        },
      });

      return newUser;
    });

    // 2. Atribuir instância TRIAL do Pool (UltraMsg)
    let instanceAssigned = false;
    try {
      const { assignTrialInstance } = await import('@/lib/services/whatsapp-pool.service');
      await assignTrialInstance(user.id);
      instanceAssigned = true;
    } catch (poolErr) {
      console.warn(`REGISTER: Conta criada para ${user.id} mas não havia instância Trial disponível no pool.`);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        nome: user.name,
        email: user.email,
        instanceReady: instanceAssigned,
      },
    });

  } catch (err) {
    console.error('REGISTRATION_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 });
  }
}
