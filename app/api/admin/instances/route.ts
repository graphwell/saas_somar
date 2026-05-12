import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Provider, InstancePlan, InstanceStatus } from '@prisma/client';

// GET — Listar todas instâncias do pool
export async function GET() {
  try {
    const instances = await prisma.whatsAppInstance.findMany({
      include: { 
        user: { 
          select: { name: true, email: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(instances);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar instâncias' }, { status: 500 });
  }
}

// POST — Adicionar instância manualmente ao pool
export async function POST(request: Request) {
  try {
    const { provider, instanceKey, apiToken, plan, name } = await request.json();
    
    // Validação básica
    if (!provider || !instanceKey || !apiToken || !plan) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const instance = await prisma.whatsAppInstance.create({
      data: {
        name: name || `Instância ${instanceKey}`,
        provider: (provider as string).toUpperCase() as Provider,
        instanceKey,
        token: apiToken,
        plan: (plan as string).toUpperCase() as InstancePlan,
        status: InstanceStatus.IDLE
      }
    });
    
    return NextResponse.json(instance);
  } catch (error: any) {
    console.error('[ADMIN_INSTANCES_POST]', error);
    return NextResponse.json({ error: 'Erro ao criar instância: ' + error.message }, { status: 500 });
  }
}

// PATCH — Desvincular, desativar, ativar ou atribuir manualmente
export async function PATCH(request: Request) {
  try {
    const { id, action, userId } = await request.json();

    if (action === 'unlink') {
      await prisma.whatsAppInstance.update({
        where: { id },
        data: { userId: null, status: InstanceStatus.IDLE, messageCount: 0 },
      });
    } else if (action === 'disable') {
      await prisma.whatsAppInstance.update({
        where: { id },
        data: { status: InstanceStatus.DISABLED },
      });
    } else if (action === 'enable') {
      await prisma.whatsAppInstance.update({
        where: { id },
        data: { status: InstanceStatus.IDLE },
      });
    } else if (action === 'assign') {
      if (!userId) {
        return NextResponse.json({ error: 'userId ausente' }, { status: 400 });
      }
      const existing = await prisma.whatsAppInstance.findFirst({
        where: { userId, status: InstanceStatus.IN_USE },
      });
      if (existing) {
        await prisma.whatsAppInstance.update({
          where: { id: existing.id },
          data: { userId: null, status: InstanceStatus.IDLE, messageCount: 0 },
        });
      }
      await prisma.whatsAppInstance.update({
        where: { id },
        data: { userId, status: InstanceStatus.IN_USE },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar instância' }, { status: 500 });
  }
}

// DELETE — Remover instância do sistema
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

    await prisma.whatsAppInstance.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar instância' }, { status: 500 });
  }
}
