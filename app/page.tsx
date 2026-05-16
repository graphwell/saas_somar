"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const geist = { fontFamily: 'var(--font-inter), system-ui, sans-serif' };
  const instrument = { fontFamily: 'var(--font-jakarta), sans-serif' };
  const mono = { fontFamily: 'var(--font-geist-mono), monospace' };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,209,102,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0,209,102,0); }
        }
        .msg { opacity: 0; animation: messageIn 0.5s ease forwards; }
        .msg-1 { animation-delay: 0.6s; }
        .msg-2 { animation-delay: 1.4s; }
        .msg-3 { animation-delay: 2.2s; }
        .msg-4 { animation-delay: 3.0s; }
        .animate-in { animation: fadeUp 0.8s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.25s; opacity: 0; }
        .delay-3 { animation-delay: 0.4s; opacity: 0; }
        .online-dot { animation: blink 2s ease-in-out infinite; }
        .pulse-green-dot { animation: pulse-green 2s ease-in-out infinite; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(0,209,102,0.2); }
      `}</style>

      <div style={{ background: '#080808', color: '#f5f5f5', overflowX: 'hidden', ...geist }}>

        {/* ── 1. NAVBAR ── */}
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 64,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: scrolled ? 'rgba(8,8,8,0.85)' : 'transparent',
          borderBottom: scrolled ? '1px solid #1f1f1f' : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}>
          <div style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Left: logo + nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <Image
                  src="/logo_branca.png"
                  alt="Somar.IA"
                  width={140}
                  height={40}
                  style={{ height: 40, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.25))' }}
                  priority
                />
                <span style={{
                  color: '#f5f5f5',
                  fontFamily: 'var(--font-jakarta), sans-serif',
                  fontWeight: 700,
                  fontSize: 18,
                }}>Somar.IA</span>
              </Link>
              <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hidden-mobile">
                <Link href="#como-funciona" style={{ color: '#999', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#999')}>Como funciona</Link>
                <Link href="#planos" style={{ color: '#999', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#999')}>Planos</Link>
                <Link href="#depoimentos" style={{ color: '#999', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#999')}>Depoimentos</Link>
              </div>
            </div>
            {/* Right: auth buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'transparent',
                  border: '1px solid #1f1f1f',
                  color: '#f5f5f5',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '6px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  ...geist,
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f1f1f')}>
                  Entrar
                </button>
              </Link>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: '#00d166',
                  border: '1px solid #00d166',
                  color: '#080808',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '6px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  ...geist,
                  transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  Começar grátis →
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── 2. HERO ── */}
        <section style={{
          paddingTop: 144,
          paddingBottom: 96,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Grid overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(#1f1f1f 1px, transparent 1px), linear-gradient(90deg, #1f1f1f 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.08,
            pointerEvents: 'none',
          }} />
          {/* Radial glow */}
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(0,209,102,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 64,
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* Badge */}
              <span className="animate-in delay-1" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid #1f1f1f',
                background: '#111',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 12,
                marginBottom: 28,
                color: '#666',
                ...geist,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00d166',
                  display: 'inline-block',
                }} className="online-dot" />
                <span style={{ color: '#00d166', fontWeight: 600 }}>Novo</span>
                <span> — Atendimento automático para pequenos negócios</span>
              </span>

              {/* H1 */}
              <h1 className="animate-in delay-2" style={{
                ...instrument,
                fontSize: 'clamp(40px, 5vw, 72px)',
                lineHeight: 1.05,
                fontWeight: 400,
                color: '#f5f5f5',
                marginBottom: 20,
                letterSpacing: '-0.02em',
              }}>
                Seu WhatsApp<br />
                atendendo sozinho,<br />
                <span style={{ fontStyle: 'italic' }}>24 horas por dia.</span>
              </h1>

              {/* Subtitle */}
              <p className="animate-in delay-3" style={{
                fontSize: 18,
                color: '#666',
                maxWidth: 460,
                lineHeight: 1.6,
                marginBottom: 36,
                ...geist,
              }}>
                Configure um agente de IA em minutos. Sem código, sem equipe.
                A Somar.IA transforma conversas de WhatsApp em agendamentos e vendas.
              </p>

              {/* CTAs */}
              <div className="animate-in delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link href="/register" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#00d166',
                    color: '#080808',
                    border: 'none',
                    fontSize: 15,
                    fontWeight: 700,
                    padding: '12px 24px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    ...geist,
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    Começar grátis →
                  </button>
                </Link>
                <Link href="#como-funciona" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: 'transparent',
                    color: '#f5f5f5',
                    border: '1px solid #1f1f1f',
                    fontSize: 15,
                    fontWeight: 500,
                    padding: '12px 24px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    ...geist,
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    Ver como funciona
                  </button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="animate-in delay-3" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex' }}>
                  {['JD', 'ML', 'AS'].map((initials, i) => (
                    <div key={initials} style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: '#111',
                      border: '2px solid #1f1f1f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#f5f5f5',
                      marginLeft: i === 0 ? 0 : -8,
                      ...mono,
                    }}>{initials}</div>
                  ))}
                </div>
                <div style={{ width: 1, height: 16, background: '#1f1f1f' }} />
                <span style={{ fontSize: 13, color: '#666', ...geist }}>
                  <span style={{ color: '#f5f5f5' }}>★★★★★</span>
                  {' '}4.9/5 · 340+ empresas
                </span>
              </div>
            </div>

            {/* Right column — chat mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 340,
                background: '#111',
                border: '1px solid #1f1f1f',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                position: 'relative',
              }}>
                {/* Chat header */}
                <div style={{
                  background: '#111',
                  borderBottom: '1px solid #1f1f1f',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#00d166',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#080808',
                  }}>A</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f5', lineHeight: 1.2 }}>
                      Assistente Somar
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#00d166',
                        display: 'inline-block',
                      }} className="online-dot" />
                      <span style={{ fontSize: 11, color: '#00d166', fontWeight: 600 }}>Online agora</span>
                    </div>
                  </div>
                </div>

                {/* Chat body */}
                <div style={{
                  background: '#0d0d0d',
                  height: 320,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: 10,
                  overflow: 'hidden',
                }}>
                  {/* msg-1: LEFT */}
                  <div className="msg msg-1" style={{
                    background: '#1a1a1a',
                    border: '1px solid #1f1f1f',
                    borderRadius: '8px 8px 8px 2px',
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#f5f5f5',
                    maxWidth: '80%',
                    alignSelf: 'flex-start',
                  }}>
                    Olá! Vocês têm horário amanhã às 15h?
                  </div>
                  {/* msg-2: RIGHT */}
                  <div className="msg msg-2" style={{
                    background: 'rgba(0,209,102,0.08)',
                    border: '1px solid rgba(0,209,102,0.15)',
                    borderRadius: '8px 8px 2px 8px',
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#f5f5f5',
                    maxWidth: '80%',
                    alignSelf: 'flex-end',
                  }}>
                    Olá! Sim, temos 15h disponível ✅ Qual serviço?
                  </div>
                  {/* msg-3: LEFT */}
                  <div className="msg msg-3" style={{
                    background: '#1a1a1a',
                    border: '1px solid #1f1f1f',
                    borderRadius: '8px 8px 8px 2px',
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#f5f5f5',
                    maxWidth: '80%',
                    alignSelf: 'flex-start',
                  }}>
                    Corte masculino
                  </div>
                  {/* msg-4: RIGHT */}
                  <div className="msg msg-4" style={{
                    background: 'rgba(0,209,102,0.08)',
                    border: '1px solid rgba(0,209,102,0.15)',
                    borderRadius: '8px 8px 2px 8px',
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#f5f5f5',
                    maxWidth: '80%',
                    alignSelf: 'flex-end',
                  }}>
                    Perfeito! Nome para o agendamento?
                  </div>
                </div>

                {/* Chat footer */}
                <div style={{
                  background: '#111',
                  borderTop: '1px solid #1f1f1f',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}>
                  <div style={{
                    flex: 1,
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: 6,
                    height: 34,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#444',
                    ...geist,
                  }}>
                    Mensagem...
                  </div>
                  <button style={{
                    width: 34,
                    height: 34,
                    background: '#00d166',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#080808',
                    flexShrink: 0,
                  }}>→</button>
                </div>

                {/* Speed badge */}
                <div style={{
                  position: 'absolute',
                  bottom: -14,
                  right: 20,
                  background: '#111',
                  border: '1px solid rgba(0,209,102,0.3)',
                  borderRadius: 20,
                  padding: '5px 12px',
                  fontSize: 11,
                  color: '#00d166',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  ...mono,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}>
                  ⚡ Respondeu em 0.8s
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. LOGOS BAR ── */}
        <section style={{
          padding: '48px 24px',
          borderTop: '1px solid #1f1f1f',
          borderBottom: '1px solid #1f1f1f',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{
              textAlign: 'center',
              fontSize: 11,
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: 28,
              ...geist,
            }}>
              Integra com as ferramentas que você já usa
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 48,
              flexWrap: 'wrap',
              opacity: 0.3,
            }}>
              {['WhatsApp', 'Google', 'Stripe', 'Instagram'].map(name => (
                <span key={name} style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#f5f5f5',
                  letterSpacing: '-0.01em',
                  ...geist,
                  cursor: 'default',
                  transition: 'opacity 0.2s',
                }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. COMO FUNCIONA ── */}
        <section id="como-funciona" style={{ padding: '128px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 72 }}>
              <h2 style={{
                ...instrument,
                fontSize: 'clamp(32px, 4vw, 56px)',
                fontWeight: 400,
                lineHeight: 1.1,
                color: '#f5f5f5',
                marginBottom: 16,
                letterSpacing: '-0.02em',
              }}>
                Pronto em menos de 5 minutos.
              </h2>
              <p style={{ fontSize: 16, color: '#666', ...geist }}>
                Configure, conecte e comece a atender. Sem código, sem complicação.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 0,
              position: 'relative',
            }}>
              {/* Dotted connecting line */}
              <div style={{
                position: 'absolute',
                top: 40,
                left: '16.6%',
                right: '16.6%',
                height: 1,
                borderTop: '1px dashed rgba(0,209,102,0.2)',
                pointerEvents: 'none',
              }} />

              {[
                {
                  num: '01',
                  title: 'Configure sua IA',
                  desc: 'Informe nome, tom de voz e serviços no dashboard. Leva menos de 3 minutos.',
                },
                {
                  num: '02',
                  title: 'Conecte o WhatsApp',
                  desc: 'Escaneie um QR code. Seu número de sempre, sem mudar nada.',
                },
                {
                  num: '03',
                  title: 'Comece a atender',
                  desc: 'Sua IA responde clientes automaticamente, 24h por dia, 7 dias por semana.',
                },
              ].map((step, i) => (
                <div key={step.num} style={{
                  padding: '40px 32px 40px 0',
                  borderTop: '1px solid #1f1f1f',
                  marginRight: i < 2 ? 32 : 0,
                }}>
                  <div style={{
                    ...mono,
                    fontSize: 80,
                    fontWeight: 700,
                    color: '#00d166',
                    lineHeight: 1,
                    marginBottom: 24,
                    letterSpacing: '-0.04em',
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#f5f5f5',
                    marginBottom: 12,
                    ...geist,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: '#666',
                    lineHeight: 1.6,
                    ...geist,
                  }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. DEMO + MÉTRICAS ── */}
        <section style={{ padding: '128px 24px', background: '#0d0d0d' }}>
          <div style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 64,
            alignItems: 'center',
          }}>
            {/* Left: bigger chat mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 340,
                background: '#111',
                border: '1px solid #1f1f1f',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              }}>
                {/* Header */}
                <div style={{
                  background: '#111',
                  borderBottom: '1px solid #1f1f1f',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#00d166',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#080808',
                  }}>B</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f5' }}>Barbearia Premium</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d166', display: 'inline-block' }} className="online-dot" />
                      <span style={{ fontSize: 11, color: '#00d166', fontWeight: 600 }}>Online agora</span>
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div style={{
                  background: '#0a0a0a',
                  height: 384,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: 10,
                  overflow: 'hidden',
                }}>
                  <div style={{ background: '#1a1a1a', border: '1px solid #1f1f1f', borderRadius: '8px 8px 8px 2px', padding: '8px 12px', fontSize: 13, color: '#f5f5f5', maxWidth: '80%', alignSelf: 'flex-start' }}>
                    Oi! Quero agendar um corte
                  </div>
                  <div style={{ background: 'rgba(0,209,102,0.08)', border: '1px solid rgba(0,209,102,0.15)', borderRadius: '8px 8px 2px 8px', padding: '8px 12px', fontSize: 13, color: '#f5f5f5', maxWidth: '80%', alignSelf: 'flex-end' }}>
                    Olá! Temos horários hoje às 14h e 16h ✅ Qual prefere?
                  </div>
                  <div style={{ background: '#1a1a1a', border: '1px solid #1f1f1f', borderRadius: '8px 8px 8px 2px', padding: '8px 12px', fontSize: 13, color: '#f5f5f5', maxWidth: '80%', alignSelf: 'flex-start' }}>
                    14h por favor!
                  </div>
                  <div style={{ background: 'rgba(0,209,102,0.08)', border: '1px solid rgba(0,209,102,0.15)', borderRadius: '8px 8px 2px 8px', padding: '8px 12px', fontSize: 13, color: '#f5f5f5', maxWidth: '80%', alignSelf: 'flex-end' }}>
                    Perfeito! Agendado para hoje às 14h 🎉 Qual seu nome?
                  </div>
                </div>
                {/* Footer */}
                <div style={{ background: '#111', borderTop: '1px solid #1f1f1f', padding: '12px 14px', display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 6, height: 34, padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 12, color: '#444', ...geist }}>
                    Mensagem...
                  </div>
                  <button style={{ width: 34, height: 34, background: '#00d166', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#080808', fontSize: 16, flexShrink: 0 }}>→</button>
                </div>
              </div>
            </div>

            {/* Right: metric cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { value: '↓ 80%', label: 'atendimentos manuais', accent: '#00d166' },
                { value: '+ 45%', label: 'conversão de leads', accent: '#f5f5f5' },
                { value: '− 12h', label: 'por semana na recepção', accent: '#666' },
              ].map(metric => (
                <div key={metric.value} style={{
                  border: '1px solid #1f1f1f',
                  background: '#111',
                  borderRadius: 8,
                  padding: 20,
                }}>
                  <div style={{
                    ...mono,
                    fontSize: 32,
                    fontWeight: 700,
                    color: metric.accent,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: 13, color: '#666', ...geist }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. DEPOIMENTOS ── */}
        <section id="depoimentos" style={{ padding: '128px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 64 }}>
              <h2 style={{
                ...instrument,
                fontSize: 'clamp(32px, 4vw, 56px)',
                fontWeight: 400,
                lineHeight: 1.1,
                color: '#f5f5f5',
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}>
                Quem já usa a Somar.IA
              </h2>
              <p style={{ fontSize: 16, color: '#666', ...geist }}>
                Empresas que escalaram o atendimento com IA.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}>
              {[
                {
                  name: 'Ricardo Santos',
                  role: 'Barbearia',
                  quote: 'Meus agendamentos acontecem 100% via WhatsApp sem eu tocar no celular.',
                  metric: '↓ 80% atendimentos manuais',
                  initials: 'RS',
                },
                {
                  name: 'Cláudia Lima',
                  role: 'Gerente Comercial',
                  quote: 'A IA nunca perde um lead, mesmo em feriados ou de madrugada.',
                  metric: '+ 45% conversão',
                  initials: 'CL',
                },
                {
                  name: 'Dr. Lucas Mendes',
                  role: 'Clínica Dentária',
                  quote: 'O atendimento de triagem ficou muito mais ágil e minha equipe foca no que importa.',
                  metric: '− 12h/semana',
                  initials: 'LM',
                },
              ].map(t => (
                <div key={t.name} style={{
                  border: '1px solid #1f1f1f',
                  borderTop: '2px solid #00d166',
                  background: '#111',
                  borderRadius: 8,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#111',
                      border: '1px solid #1f1f1f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#f5f5f5',
                      ...mono,
                      flexShrink: 0,
                    }}>
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f5', ...geist }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', ...geist }}>{t.role}</div>
                    </div>
                  </div>
                  <p style={{
                    fontSize: 14,
                    color: '#999',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    ...geist,
                  }}>
                    "{t.quote}"
                  </p>
                  <div style={{
                    fontSize: 12,
                    color: '#00d166',
                    fontWeight: 700,
                    ...mono,
                    paddingTop: 12,
                    borderTop: '1px solid #1f1f1f',
                  }}>
                    {t.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. PLANOS ── */}
        <section id="planos" style={{ padding: '128px 24px', background: '#0d0d0d' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{
                ...instrument,
                fontSize: 'clamp(32px, 4vw, 56px)',
                fontWeight: 400,
                lineHeight: 1.1,
                color: '#f5f5f5',
                marginBottom: 32,
                letterSpacing: '-0.02em',
              }}>
                O plano ideal para o seu negócio.
              </h2>

              {/* Toggle */}
              <div style={{
                display: 'inline-flex',
                background: '#111',
                border: '1px solid #1f1f1f',
                borderRadius: 8,
                padding: 4,
              }}>
                <button
                  onClick={() => setIsAnnual(false)}
                  style={{
                    padding: '7px 20px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    ...geist,
                    background: !isAnnual ? '#1f1f1f' : 'transparent',
                    color: !isAnnual ? '#f5f5f5' : '#666',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  style={{
                    padding: '7px 20px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    ...geist,
                    background: isAnnual ? '#1f1f1f' : 'transparent',
                    color: isAnnual ? '#f5f5f5' : '#666',
                    transition: 'background 0.2s, color 0.2s',
                    position: 'relative',
                  }}
                >
                  Anual
                  <span style={{
                    position: 'absolute',
                    top: -18,
                    right: -4,
                    background: '#00d166',
                    color: '#080808',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    ...mono,
                  }}>
                    −20%
                  </span>
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
              alignItems: 'start',
            }}>
              {/* FREE */}
              <div style={{
                border: '1px solid #1f1f1f',
                background: '#111',
                borderRadius: 8,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, ...mono }}>FREE</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 13, color: '#666', ...mono }}>R$</span>
                    <span style={{ fontSize: 48, fontWeight: 700, color: '#f5f5f5', lineHeight: 1, ...mono }}>0</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['100 mensagens/mês', '1 número WhatsApp', 'IA básica'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#999', ...geist }}>
                      <span style={{ color: '#00d166', fontSize: 12 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    padding: '10px 0',
                    background: 'transparent',
                    border: '1px solid #1f1f1f',
                    borderRadius: 6,
                    color: '#f5f5f5',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...geist,
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f1f1f')}>
                    Começar grátis
                  </button>
                </Link>
              </div>

              {/* PRO — highlighted */}
              <div style={{
                border: '1px solid #00d166',
                background: '#111',
                borderRadius: 8,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                boxShadow: '0 0 30px rgba(0,209,102,0.08)',
                position: 'relative',
              }}>
                {/* Badge */}
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#00d166',
                  color: '#080808',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  ...mono,
                }}>
                  Mais popular
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#00d166', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, ...mono }}>PRO</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 13, color: '#666', ...mono }}>R$</span>
                    <span style={{ fontSize: 48, fontWeight: 700, color: '#f5f5f5', lineHeight: 1, ...mono }}>
                      {isAnnual ? '157' : '197'}
                    </span>
                    <span style={{ fontSize: 13, color: '#666', ...mono }}>/mês</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    'Mensagens ilimitadas',
                    '3 números WhatsApp',
                    'IA avançada',
                    'Relatórios',
                    'Suporte prioritário',
                  ].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#f5f5f5', ...geist }}>
                      <span style={{ color: '#00d166', fontSize: 12 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    padding: '10px 0',
                    background: '#00d166',
                    border: 'none',
                    borderRadius: 6,
                    color: '#080808',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    ...geist,
                    transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    Assinar Pro
                  </button>
                </Link>
              </div>

              {/* ENTERPRISE */}
              <div style={{
                border: '1px solid #1f1f1f',
                background: '#111',
                borderRadius: 8,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, ...mono }}>ENTERPRISE</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f5f5f5', lineHeight: 1.2, ...geist }}>
                    Sob consulta
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Tudo do Pro', 'Múltiplos números', 'Conexão com outros sistemas', 'Gerente de conta dedicado'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#999', ...geist }}>
                      <span style={{ color: '#00d166', fontSize: 12 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button style={{
                  width: '100%',
                  padding: '10px 0',
                  background: 'transparent',
                  border: '1px solid #1f1f1f',
                  borderRadius: 6,
                  color: '#f5f5f5',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  ...geist,
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f1f1f')}>
                  Falar com vendas
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. CTA FINAL ── */}
        <section style={{ padding: '128px 24px', background: '#0d0d0d' }}>
          <div style={{
            maxWidth: 672,
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <h2 style={{
              ...instrument,
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 400,
              lineHeight: 1.1,
              color: '#f5f5f5',
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}>
              Pronto para nunca mais perder um cliente?
            </h2>
            <p style={{
              fontSize: 15,
              color: '#666',
              marginBottom: 40,
              ...geist,
            }}>
              7 dias grátis · Sem cartão de crédito · Cancele quando quiser
            </p>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#00d166',
                color: '#080808',
                border: 'none',
                fontSize: 16,
                fontWeight: 700,
                padding: '14px 32px',
                borderRadius: 8,
                cursor: 'pointer',
                ...geist,
                transition: 'opacity 0.2s, transform 0.2s',
                display: 'inline-block',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Começar agora gratuitamente →
              </button>
            </Link>
            <p style={{
              fontSize: 12,
              color: '#444',
              marginTop: 20,
              ...geist,
            }}>
              Junte-se a 340+ empresas automatizando o atendimento no Brasil
            </p>
          </div>
        </section>

        {/* ── 9. FOOTER ── */}
        <footer style={{
          padding: '64px 24px',
          borderTop: '1px solid #1f1f1f',
        }}>
          <div style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <Image
                src="/logo_branca.png"
                alt="Somar.IA"
                width={120}
                height={34}
                style={{ height: 34, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' }}
              />
              <span style={{
                color: '#f5f5f5',
                fontFamily: 'var(--font-jakarta), sans-serif',
                fontWeight: 600,
                fontSize: 16,
              }}>Somar.IA</span>
            </Link>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { label: 'Termos', href: '#' },
                { label: 'Privacidade', href: '#' },
                { label: 'Suporte', href: '#' },
                { label: 'Painel', href: '/login' },
              ].map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ fontSize: 13, color: '#666', textDecoration: 'none', ...geist, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#666')}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <span style={{ fontSize: 12, color: '#444', ...geist }}>
              © 2025 Somar.IA
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
