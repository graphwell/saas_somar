import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EVOLUTION_URL = (process.env.EVOLUTION_API_URL || 'https://evolution.somar.ia.br').replace(/^http:\/\//i, 'https://');
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

// DELETE /api/whatsapp/evolution/reset
// Deleta a instância atual do usuário (Evolution + banco) e cria uma nova
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // 1. Buscar instância atual do usuário no banco
    const instance = await prisma.whatsAppInstance.findFirst({
      where: { userId }
    });

    if (instance) {
      // 2. Tentar deletar na Evolution API de forma limpa usando o serviço centralizado
      const { WhatsappLifecycleService } = await import('@/lib/services/whatsapp-lifecycle.service');
      await WhatsappLifecycleService.forceDeleteInstance(instance.instanceKey);

      // 3. Deletar do banco de dados
      await prisma.whatsAppInstance.delete({
        where: { id: instance.id }
      });
    }

    return NextResponse.json({ success: true, message: 'Instância removida com sucesso.' });

  } catch (err: any) {
    console.error('RESET_INSTANCE_ERROR:', err);
    return NextResponse.json({ error: 'Erro ao resetar instância: ' + err.message }, { status: 500 });
  }
}
