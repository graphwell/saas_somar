import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhatsappLifecycleService } from '@/lib/services/whatsapp-lifecycle.service';

// GET /api/cron/cleanup-instances
export async function GET(req: Request) {
  try {
    // Autenticação básica para proteger a rota cron (se não for chamada pela Vercel)
    // Opcional: pode checar req.headers.get('Authorization') se usar Vercel Cron.

    // Busca instâncias no banco com status != 'connected' há mais de 1h e com userId atrelado.
    // Assim não excluímos instâncias que estão conectadas ativamente.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const ghostInstances = await prisma.whatsAppInstance.findMany({
      where: {
        status: { not: 'connected' },
        updatedAt: { lt: oneHourAgo },
        userId: { not: null }
      }
    });

    let cleaned = 0;

    for (const instance of ghostInstances) {
      // Pré-check com GET para garantir que existe antes de tentar deletar
      const exists = await WhatsappLifecycleService.checkInstanceExists(instance.instanceKey);
      
      if (exists) {
        await WhatsappLifecycleService.forceDeleteInstance(instance.instanceKey);
      }

      // Atualiza o banco, liberando a instância (userId: null) para o pool novamente.
      await prisma.whatsAppInstance.update({
        where: { id: instance.id },
        data: { status: 'disconnected', userId: null }
      });

      cleaned++;
    }

    return NextResponse.json({ success: true, cleaned });
  } catch (err) {
    console.error('[CRON Cleanup] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
