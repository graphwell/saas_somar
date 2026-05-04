import { Users, Plus, ShieldCheck, CreditCard, Search, Filter } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

type UserWithCount = Prisma.UserGetPayload<{
  include: {
    subscription: true;
    _count: { select: { instances: true } };
  };
}>;

// This is a Server Component to fetch data directly via Prisma
export default async function AdminUsersPage() {
  let users: UserWithCount[] = [];
  try {
    users = await prisma.user.findMany({
      include: {
        subscription: true,
        _count: {
          select: { instances: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Erro ao buscar usuários (verifique a conexão com o banco):", error);
    users = [];
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Users size={24} className="text-primary" style={{ color: 'var(--primary-color)' }} />
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Gestão de Clientes</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Administração central de contas, níveis de acesso e faturamento Stripe.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              style={{ 
                padding: '0.625rem 1rem 0.625rem 2.5rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--surface-color)',
                width: '300px',
                outline: 'none'
              }} 
            />
          </div>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} />
            Filtros
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total de Clientes', value: users.length, icon: Users, color: '#3b82f6' },
          { label: 'Assinantes Ativos', value: users.filter(u => u.subscription?.status === 'active').length, icon: CreditCard, color: '#10b981' },
          { label: 'Instâncias Ativas', value: users.reduce((acc, curr) => acc + (curr._count?.instances || 0), 0), icon: ShieldCheck, color: '#8b5cf6' },
          { label: 'MRR Estimado', value: 'R$ 0,00', icon: CreditCard, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: `${stat.color}15`, padding: '0.75rem', borderRadius: '12px' }}>
              <stat.icon size={24} style={{ color: stat.color }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>CLIENTE</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>FUNÇÃO</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>PLANO / STRIPE</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>INSTÂNCIAS</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>STATUS</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>ÚLTIMO LOGIN</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {/* Placeholder for empty state */}
                    Nenhum cliente encontrado. Conecte o banco de dados PostgreSQL no arquivo .env para começar.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', cursor: 'default' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                       <span style={{ 
                         fontSize: '0.75rem', 
                         fontWeight: 700, 
                         padding: '0.25rem 0.625rem', 
                         borderRadius: '20px', 
                         backgroundColor: user.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                         color: user.role === 'ADMIN' ? '#8b5cf6' : '#6b7280'
                       }}>
                         {user.role}
                       </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{user.subscription?.planType || 'free'}</span>
                        {user.subscription?.status === 'active' && <ShieldCheck size={14} style={{ color: '#10b981' }} />}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {user.subscription?.stripeCustomerId || 'Sem ID Stripe'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontSize: '0.925rem', fontWeight: 500 }}>{user._count?.instances || 0} Ativas</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className={`status ${user.subscription?.status === 'active' ? 'active' : 'inactive'}`} style={{ fontSize: '0.75rem' }}>
                        {user.subscription?.status === 'active' ? 'Assinante' : 'Inativo / Free'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <a href={`/agente?targetUserId=${user.id}`} style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: 'var(--primary-color)', 
                        fontWeight: 600, 
                        fontSize: '0.875rem', 
                        cursor: 'pointer',
                        padding: '0.5rem',
                        textDecoration: 'none'
                      }}>
                        Editar Agente
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
