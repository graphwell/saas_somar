import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://evolution.somar.ia.br';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

// Cria instância exclusiva na Evolution API para o novo usuário
async function createEvolutionInstance(userId: string, userName: string): Promise<string | null> {
  try {
    // instanceKey único: nome sanitizado + primeiros 8 chars do userId
    const safeName = userName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 20)
      .replace(/^-|-$/g, '');

    const instanceKey = `${safeName}-${userId.slice(0, 8)}`;
    const webhookUrl = `${process.env.NEXTAUTH_URL || ''}/api/whatsapp/webhook/evolution`;

    const body = {
      instanceName: instanceKey,
      token: instanceKey,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhook: {
        enabled: true,
        url: webhookUrl,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
        byEvents: true,
        base64: false,
      },
      settings: {
        rejectCall: false,
        msgCall: '',
        groupsIgnore: true,
        alwaysOnline: true,
        readMessages: true,
        readStatus: false,
        syncFullHistory: false,
      },
    };

    const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: EVOLUTION_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('EVOLUTION_CREATE_ERROR:', err);
      return null;
    }

    return instanceKey;
  } catch (err) {
    console.error('EVOLUTION_INSTANCE_CREATION_FAILED:', err);
    return null;
  }
}

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

    // 2. Criar instância exclusiva na Evolution API (fora da transaction para não bloquear)
    const instanceKey = await createEvolutionInstance(user.id, nomeTrimmed);

    if (instanceKey) {
      // 3. Salvar instância no banco vinculada ao usuário
      await prisma.whatsAppInstance.create({
        data: {
          userId: user.id,
          name: `WhatsApp de ${nomeTrimmed}`,
          provider: 'evolution',
          instanceKey,
          token: instanceKey,
          status: 'disconnected', // Aguardando scan do QR Code
        },
      });
    } else {
      // Log do erro mas não bloqueia o cadastro — usuário pode criar instância depois
      console.warn(`REGISTER: Conta criada para ${user.id} mas instância Evolution falhou. Será criada no primeiro acesso.`);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        nome: user.name,
        email: user.email,
        instanceReady: !!instanceKey,
      },
    });

  } catch (err) {
    console.error('REGISTRATION_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 });
  }
}
