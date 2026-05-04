const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  // 1. Criar Administrador Master
  const adminPassword = await bcrypt.hash('adminsomar2025', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@somar.ia' },
    update: {},
    create: {
      email: 'admin@somar.ia',
      name: 'Admin Somar.IA',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // 2. Criar Usuário Trial
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      email: 'cliente@exemplo.com',
      name: 'Empresa Trial',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('✅ Usuário Trial criado:', user.email);

  // 3. Criar Assinatura Trial
  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      planType: 'trial',
      status: 'active',
      messagesLimit: 100,
      messagesUsed: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    }
  });
  console.log('✅ Assinatura criada para o Usuário Trial.');

  // 4. Configuração Inicial do Agente
  const agent = await prisma.agent.create({
    data: {
      userId: user.id,
      name: 'Bella',
      systemPrompt: 'Você é a Bella, assistente virtual da Empresa Trial...',
      temperature: 0.7,
    }
  });
  console.log('✅ Configuração do Agente criada para o usuário.');

  // 5. Vincular Instância do WhatsApp
  await prisma.whatsAppInstance.create({
    data: {
      userId: user.id,
      name: 'Atendimento Principal',
      provider: 'ultramsg',
      instanceKey: 'trial_instance_01',
      token: 'token_t1',
      status: 'available',
      agentId: agent.id,
    }
  });
  console.log('✅ Instância vinculada ao usuário de teste.');

  console.log('🚀 Seeding finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
