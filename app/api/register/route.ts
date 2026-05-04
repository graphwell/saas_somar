import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Regex RFC 5322 simplificado — suficiente para produção
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, senha } = body;

    // Validações de tipo e presença
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

    // bcrypt tem limite de 72 bytes — acima disso os bytes são silenciosamente truncados
    if (senha.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
    }
    if (senha.length > 72) {
      return NextResponse.json({ error: 'A senha deve ter no máximo 72 caracteres.' }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({
      where: { email: emailTrimmed },
    });

    if (userExists) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(senha, 12);

    const user = await prisma.$transaction(async (tx) => {
      // 1. Criar Usuário com Configuração de Agente padrão
      const newUser = await tx.user.create({
        data: {
          nome: nomeTrimmed,
          email: emailTrimmed,
          senha: hashedPassword,
          role: 'USER',
          agentConfig: {
            create: {
              prompt: `Você é uma assistente virtual profissional para a empresa ${nomeTrimmed}.`,
              temperature: 0.7,
            }
          }
        },
      });

      // 2. Buscar Instância Trial disponível no Pool
      const trialInstance = await tx.instance.findFirst({
        where: { type: 'trial', status: 'available' }
      });

      if (trialInstance) {
        // 3. Vincular Instância
        await tx.instance.update({
          where: { id: trialInstance.id },
          data: { status: 'in_use' }
        });

        await tx.userInstance.create({
          data: {
            userId: newUser.id,
            instanceId: trialInstance.id,
            plan: 'trial',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            lastResetAt: new Date().toISOString().slice(0, 10),
          }
        });
      }

      return newUser;
    });

    return NextResponse.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        hasTrialInstance: !!(await prisma.userInstance.findUnique({ where: { userId: user.id } }))
      }
    });


  } catch (err) {
    console.error('REGISTRATION_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 });
  }
}
