import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Rota de setup único — cria o admin se não existir
// Remova este arquivo após o primeiro uso
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Chave inválida' }, { status: 403 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@somar.ia' },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Admin já existe.',
        email: existing.email,
        role: existing.role,
      });
    }

    const hashed = await bcrypt.hash('adminsomar2025', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@somar.ia',
        name: 'Admin Somar.IA',
        password: hashed,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin criado com sucesso.',
      email: admin.email,
      role: admin.role,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
