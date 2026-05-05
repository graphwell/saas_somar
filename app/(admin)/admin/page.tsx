import { 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Database metrics (will work after migration)
  let stats = {
    totalUsers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    activeInstances: 0
  };

  try {
    const totalUsers = await prisma.user.count();
    const activeSubscribers = await prisma.user.count({
      where: { 
        subscription: {
          status: 'active'
        }
      }
    });
    const activeInstances = await prisma.whatsAppInstance.count({
      where: { status: 'IN_USE' }
    });
    
    stats = {
      totalUsers,
      activeSubscribers,
      monthlyRevenue: activeSubscribers * 99, // Hypothetical math
      activeInstances
    };
  } catch (error) {
    console.error("Dashboard stats fetch failed:", error);
  }

  const cards = [
    { label: 'Total de Clientes', value: stats.totalUsers, icon: Users, trend: '+12%', trendUp: true, color: '#3b82f6' },
    { label: 'Assinantes Ativos', value: stats.activeSubscribers, icon: CreditCard, trend: '+5%', trendUp: true, color: '#10b981' },
    { label: 'Receita Mensal (MRR)', value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`, icon: TrendingUp, trend: '+18%', trendUp: true, color: '#8b5cf6' },
    { label: 'Instâncias Conectadas', value: stats.activeInstances, icon: Activity, trend: '-2%', trendUp: false, color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Painel Administrativo Somar.IA</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Bem-vindo de volta! Aqui está o que está acontecendo na plataforma hoje.</p>
      </header>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {cards.map((card, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: `${card.color}15`, padding: '0.75rem', borderRadius: '12px' }}>
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                color: card.trendUp ? '#10b981' : '#ef4444',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {card.trend}
                {card.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>{card.label}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{card.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity / System Alerts */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Alertas do Sistema</h2>
            <Link href="/admin/logs" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: 500 }}>Ver todos os logs</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { type: 'warning', msg: 'Instância Inst_99A desconectada há 2 horas (Cliente: João Silva)', time: '2h atrás' },
              { type: 'info', msg: 'Nova assinatura realizada: Plano Pro (Cliente: Clínica Sorriso)', time: '5h atrás' },
              { type: 'error', msg: 'Falha no Webhook da UltraMsg: 404 em /api/webhook/test', time: '12h atrás' }
            ].map((alert, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem', 
                backgroundColor: 'var(--surface-color)', 
                borderRadius: '8px',
                borderLeft: `4px solid ${alert.type === 'warning' ? '#f59e0b' : alert.type === 'error' ? '#ef4444' : '#3b82f6'}`
              }}>
                <AlertCircle size={20} style={{ 
                  color: alert.type === 'warning' ? '#f59e0b' : alert.type === 'error' ? '#ef4444' : '#3b82f6',
                  flexShrink: 0 
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>{alert.msg}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Distribuição de Planos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { label: 'Free', count: stats.totalUsers - stats.activeSubscribers, color: '#94a3b8' },
              { label: 'Pro', count: stats.activeSubscribers, color: '#8b5cf6' },
              { label: 'Enterprise', count: 0, color: '#0ea5e9' }
            ].map((plan, i) => {
              const percentage = stats.totalUsers > 0 ? (plan.count / stats.totalUsers) * 100 : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 500 }}>{plan.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{plan.count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--surface-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: plan.color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px dashed rgba(59, 130, 246, 0.3)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Package size={20} style={{ color: 'var(--primary-color)' }} />
              <p style={{ fontSize: '0.825rem', margin: 0, fontWeight: 500 }}>Gerencie seus planos e preços diretamente no Dashboard do Stripe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
