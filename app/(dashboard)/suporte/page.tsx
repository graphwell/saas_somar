import { HelpCircle, MessageSquare, BookOpen, Mail } from 'lucide-react';

export default function SuportePage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ backgroundColor: 'rgba(0, 229, 160, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
            <HelpCircle size={24} style={{ color: '#00E5A0' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Suporte</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Estamos aqui para ajudar. Escolha o canal de suporte mais conveniente.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          <div style={{ backgroundColor: 'rgba(0, 229, 160, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} style={{ color: '#00E5A0' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.375rem' }}>WhatsApp</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Fale com nossa equipe diretamente pelo WhatsApp para suporte rápido.
            </p>
          </div>
        </a>

        <a
          href="mailto:suporte@somar.ia.br"
          className="card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          <div style={{ backgroundColor: 'rgba(108, 93, 211, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={24} style={{ color: '#6C5DD3' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.375rem' }}>E-mail</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Envie um e-mail para suporte@somar.ia.br e responderemos em até 24h.
            </p>
          </div>
        </a>

        <div
          className="card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.6 }}
        >
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.375rem' }}>Documentação</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Base de conhecimento e tutoriais em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
