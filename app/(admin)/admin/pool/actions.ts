'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addInstanceToPool(formData: FormData) {
  const instanceKey = formData.get('instanceId') as string;
  const token = formData.get('token') as string;
  const provider = formData.get('provider') as string;
  const name = formData.get('name') as string || 'Instância de Pool';

  if (!instanceKey || !token || !provider) {
    throw new Error('Campos obrigatórios ausentes.');
  }

  try {
    await prisma.whatsAppInstance.create({
      data: {
        instanceKey,
        token,
        provider,
        name,
        status: 'disconnected', // Default status
        // userId is null by default, meaning it's in the pool
      },
    });

    revalidatePath('/admin/pool');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao adicionar instância ao pool:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteInstance(id: string) {
  try {
    await prisma.whatsAppInstance.delete({
      where: { id },
    });
    revalidatePath('/admin/pool');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignInstanceToUser(id: string, userId: string) {
  try {
    await prisma.whatsAppInstance.update({
      where: { id },
      data: { userId },
    });
    revalidatePath('/admin/pool');
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
