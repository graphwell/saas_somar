import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Settings, User, Lock, Bell } from 'lucide-react';

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ backgroundColor: 'rgba(108, 93, 211, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
            <Settings size={24} style={{ color: '#6C5DD3' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Configurações</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Gerencie sua conta e preferências da plataforma.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Perfil */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <User size={20} style={{ color: '#6C5DD3' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Perfil</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nome</label>
              <div style={{ padding: '0.625rem 1rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.925rem' }}>
                {user?.name || '—'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>E-mail</label>
              <div style={{ padding: '0.625rem 1rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.925rem' }}>
                {user?.email || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="card" style={{ padding: '1.5rem', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Lock size={20} style={{ color: '#f59e0b' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Segurança</h2>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '20px', fontWeight: 600 }}>Em breve</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Alteração de senha e autenticação de dois fatores disponíveis em breve.
          </p>
        </div>

        {/* Notificações */}
        <div className="card" style={{ padding: '1.5rem', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Bell size={20} style={{ color: '#3b82f6' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Notificações</h2>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '20px', fontWeight: 600 }}>Em breve</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Controle de alertas por e-mail e WhatsApp disponíveis em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
