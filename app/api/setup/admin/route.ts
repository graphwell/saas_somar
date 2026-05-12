import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Rota de setup — cria admin e testa conexão com DB
// Remova este arquivo após uso
export async function GET() {
  const results: Record<string, any> = {};

  // 1. Testa conexão com banco
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.db = 'OK';
  } catch (e: any) {
    results.db = 'ERRO: ' + e.message;
    return NextResponse.json(results, { status: 500 });
  }

  // 2. Verifica se admin já existe
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@somar.ia' },
      select: { id: true, email: true, role: true },
    });

    if (existing) {
      results.admin = 'já existe';
      results.user = existing;
      return NextResponse.json(results);
    }

    // 3. Cria o admin
    const hashed = await bcrypt.hash('adminsomar2025', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@somar.ia',
        name: 'Admin Somar.IA',
        password: hashed,
        role: 'ADMIN',
      },
      select: { id: true, email: true, role: true },
    });

    results.admin = 'criado agora';
    results.user = admin;
    return NextResponse.json(results);
  } catch (e: any) {
    results.admin = 'ERRO: ' + e.message;
    return NextResponse.json(results, { status: 500 });
  }
}
