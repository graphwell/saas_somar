"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MessageSquare, 
  Smartphone, 
  Zap, 
  Check, 
  ArrowRight, 
  Star,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-bg-base text-text-primary selection:bg-accent-green/30 overflow-x-hidden">
      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-base ${scrolled ? 'bg-bg-base/85 backdrop-blur-xl h-16 border-b border-border-sutil' : 'bg-transparent h-20'}`}>
        <div className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/">
              <Image 
                src="/Logo Soma2.png" 
                alt="Somar.IA" 
                width={120} 
                height={40} 
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-text-secondary">
              <Link href="#como-funciona" className="hover:text-text-primary transition-base">Como funciona</Link>
              <Link href="#planos" className="hover:text-text-primary transition-base">Planos</Link>
              <Link href="#depoimentos" className="hover:text-text-primary transition-base">Depoimentos</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-[14px] px-4 h-9 border border-border-elevated rounded-lg">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-linear-to-br from-accent-green to-[#00B070] text-bg-base font-bold px-5 h-9 rounded-lg">
                Testar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-[160px] pb-20 overflow-hidden grid-bg">
        {/* Glow Effects */}
        <div className="glow-green w-[500px] h-[500px] top-0 left-1/4" />
        <div className="glow-purple w-[500px] h-[500px] top-1/3 right-1/4" />

        <div className="max-w-[1100px] mx-auto px-6 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center relative z-10">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-[13px] font-bold mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              340+ empresas automatizando o atendimento
            </div>

            <h1 className="text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-0.04em] mb-6">
              Seu WhatsApp <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-green to-accent-purple">
                atendendo sozinho,
              </span> <br />
              24 horas por dia
            </h1>

            <p className="text-[18px] text-text-secondary max-w-[480px] leading-relaxed mb-10 font-medium">
              Configure um agente de IA em minutos. Sem código. Sem equipe. Deixe que a Somar.IA transforme conversas em lucro.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-[15px] font-bold rounded-lg shadow-2xl shadow-accent-green/20 group">
                  Começar trial grátis 
                  <ArrowRight size={18} className="ml-2 transition-base group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button variant="outline" size="lg" className="h-14 px-8 text-[15px] font-bold rounded-lg bg-white/5 border-white/10 hover:border-white/20">
                  Ver demonstração
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 border-t border-white/5 pt-8 w-full">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-bg-base bg-linear-to-br from-accent-green to-accent-purple flex items-center justify-center text-[10px] font-bold text-bg-base">JD</div>
                <div className="w-8 h-8 rounded-full border-2 border-bg-base bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-bg-base transition-base -ml-2">ML</div>
                <div className="w-8 h-8 rounded-full border-2 border-bg-base bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-[10px] font-bold text-bg-base -ml-2">AS</div>
              </div>
              <div className="h-5 w-px bg-white/10" />
              <div className="text-[14px] text-text-secondary">
                <span className="text-[#F59E0B]">★★★★★</span> <span className="font-bold text-text-primary ml-1">4.9/5</span> por usuários satisfeitos
              </div>
            </div>
          </div>

          {/* Visual Direito: Chat Mockup Refined */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-[340px] bg-bg-surface border border-border-sutil rounded-[24px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)] relative z-10">
              {/* Chat Header */}
              <div className="bg-bg-elevated/50 p-5 border-b border-border-sutil flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-green flex items-center justify-center text-bg-base font-extrabold text-xs">A</div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-text-primary leading-tight">Assistente Somar</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                    <span className="text-[11px] text-accent-green font-bold uppercase tracking-wider">Online agora</span>
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 space-y-4 h-[340px] flex flex-col justify-end bg-black/20">
                <div className="bg-bg-elevated border border-border-sutil p-3 rounded-2xl rounded-tl-none text-[14px] max-w-[85%] self-start animate-message-in">
                  Olá! Vocês têm disponibilidade amanhã?
                </div>
                <div className="bg-accent-green/12 border border-accent-green/20 p-3 rounded-2xl rounded-tr-none text-[14px] max-w-[85%] self-end text-text-primary animate-message-in [animation-delay:0.8s] opacity-0 fill-mode-forwards">
                  Olá! Sim, temos horários disponíveis ✅ Qual serviço deseja?
                </div>
                <div className="bg-bg-elevated border border-border-sutil p-3 rounded-2xl rounded-tl-none text-[14px] max-w-[85%] self-start animate-message-in [animation-delay:1.6s] opacity-0 fill-mode-forwards">
                  Corte de cabelo masculino
                </div>
                <div className="bg-accent-green/12 border border-accent-green/20 p-3 rounded-2xl rounded-tr-none text-[14px] max-w-[85%] self-end text-text-primary animate-message-in [animation-delay:2.4s] opacity-0 fill-mode-forwards">
                  Perfeito! Temos 10h, 14h e 16h. Qual prefere?
                </div>
              </div>

              {/* Chat Footer */}
              <div className="p-4 bg-bg-elevated/20 border-t border-border-sutil flex gap-2">
                <div className="flex-1 bg-white/5 h-9 rounded-lg px-4 text-[11px] flex items-center text-text-muted">Aguardando resposta...</div>
                <div className="w-9 h-9 rounded-lg bg-accent-green flex items-center justify-center text-bg-base transition-base hover:scale-105 active:scale-95"><ArrowRight size={16} /></div>
              </div>

              {/* Lightning Badge */}
              <div className="absolute -bottom-4 right-6 translate-y-[-50%] bg-bg-surface border border-accent-green/30 rounded-full px-4 py-1.5 shadow-2xl flex items-center gap-2 z-20">
                <Zap size={12} className="text-accent-green" fill="currentColor" />
                <span className="text-[12px] font-bold text-accent-green whitespace-nowrap">Respondeu em 0.8s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PARCEIROS (SEPARATOR) */}
      <section className="py-12 border-y border-white/5 bg-bg-surface/30">
        <div className="max-w-[1100px] mx-auto px-6">
          <p className="text-center text-[13px] font-bold text-text-muted uppercase tracking-widest mb-10">Integra com as ferramentas que você já usa</p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500">
             <span className="text-xl font-bold font-display italic">WhatsApp</span>
             <span className="text-xl font-bold font-display">OpenAI</span>
             <span className="text-xl font-bold font-display uppercase tracking-tighter">Stripe</span>
             <span className="text-xl font-bold font-display lowercase">n8n</span>
             <span className="text-xl font-bold font-display">HubSpot</span>
             <span className="text-xl font-bold font-display tracking-widest">SLACK</span>
          </div>
        </div>
      </section>

      {/* 4. COMO FUNCIONA */}
      <section id="como-funciona" className="py-[120px] bg-bg-base">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="max-w-[600px] mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Pronto em menos de <span className="text-accent-green">5 minutos</span></h2>
            <p className="text-text-secondary text-lg leading-relaxed">O processo é simples e não exige nenhuma habilidade técnica ou linha de código.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-[120px] left-[10%] right-[10%] h-px bg-linear-to-r from-accent-green/0 via-accent-green/20 to-accent-green/0" />

            {[
              { step: '01', icon: MessageSquare, title: 'Configure sua IA', desc: 'Informe o nome, tom de voz e serviços do seu negócio em nosso dashboard.' },
              { step: '02', icon: Smartphone, title: 'Conecte o WhatsApp', desc: 'Escaneie um QR code rapidamente. Seu número de sempre, sem mudar nada.' },
              { step: '03', icon: Zap, title: 'Comece a atender', desc: 'Sua IA começa a responder clientes automaticamente, aumentando suas conversas em vendas.' },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <span className="absolute -top-12 left-0 text-[100px] font-black text-accent-green/5 select-none pointer-events-none group-hover:text-accent-green/10 transition-base">
                  {item.step}
                </span>
                <div className="relative pt-6 border-l-2 border-accent-green/30 pl-8 group-hover:border-accent-green transition-base">
                  <div className="w-14 h-14 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center text-accent-green mb-8 group-hover:scale-110 transition-base">
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-xl font-extrabold mb-4">{item.title}</h3>
                  <p className="text-text-secondary text-[15px] leading-relaxed italic opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PLANOS & PREÇOS */}
      <section id="planos" className="py-[120px] relative overflow-hidden">
        <div className="glow-purple w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-20 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tight">O plano ideal para o seu negócio</h2>
            
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button onClick={() => setIsAnnual(false)} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-base ${!isAnnual ? 'bg-bg-elevated text-text-primary shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>Mensal</button>
              <button onClick={() => setIsAnnual(true)} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-base relative ${isAnnual ? 'bg-bg-elevated text-text-primary shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>
                Anual
                <span className="absolute -top-5 -right-3 bg-accent-purple text-text-primary text-[9px] px-2 py-0.5 rounded-full font-black animate-bounce-soft uppercase">
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* FREE */}
            <Card className="flex flex-col gap-10 hover:border-white/10">
              <div>
                <h3 className="text-lg font-bold text-text-secondary">FREE</h3>
                <p className="text-text-muted text-[13px] font-medium mt-1">Experimente o poder da IA</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-bold text-text-muted align-top -mt-2">R$</span>
                <span className="text-5xl font-extrabold font-display">0</span>
              </div>
              <ul className="space-y-5 flex-1">
                {['100 mensagens/mês', '1 número WhatsApp', 'IA básica'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-text-secondary"><Check size={16} className="text-accent-green shrink-0" /> {f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full h-12 rounded-xl">Começar grátis</Button>
            </Card>

            {/* PRO */}
            <Card isPremium className="flex flex-col gap-10 relative group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-accent-green to-accent-purple text-bg-base font-black text-[11px] px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Mais popular</div>
              
              <div>
                <h3 className="text-lg font-extrabold text-accent-green">PRO</h3>
                <p className="text-text-muted text-[13px] font-medium mt-1">Resultados acelerados</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-bold text-text-primary align-top -mt-2">R$</span>
                <span className="text-5xl font-black font-display">{isAnnual ? '157' : '197'}</span>
                <span className="text-text-muted font-bold text-sm">/mês</span>
              </div>
              <ul className="space-y-5 flex-1">
                {[
                  'Mensagens ilimitadas',
                  '3 números WhatsApp',
                  'IA avançada com personalidade',
                  'Relatórios e histórico',
                  'Suporte prioritário'
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text-primary font-semibold tracking-tight">
                    <Check size={18} className="text-accent-green shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full h-14 rounded-xl text-md shadow-2xl shadow-accent-green/20">Assinar Pro</Button>
            </Card>

            {/* ENTERPRISE */}
            <Card className="flex flex-col gap-10 hover:border-white/10">
              <div>
                <h3 className="text-lg font-bold text-text-secondary">ENTERPRISE</h3>
                <p className="text-text-muted text-[13px] font-medium mt-1">Sob medida para você</p>
              </div>
              <div className="text-4xl font-extrabold leading-tight">Consulte</div>
              <ul className="space-y-5 flex-1">
                {['Tudo do Pro', 'Múltiplos números', 'API de Integração', 'Customer Success'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-text-secondary"><Check size={16} className="text-accent-purple shrink-0" /> {f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full h-12 rounded-xl group hover:border-accent-purple/30 text-text-secondary hover:text-accent-purple">Falar com vendas</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. DEPOIMENTOS */}
      <section id="depoimentos" className="py-[120px] bg-bg-base relative">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tighter">Quem já usa a Somar.IA</h2>
            <p className="text-text-secondary text-lg">Empresas que escalaram seu atendimento com inteligência.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ricardo Santos', role: 'Proprietário de Barbearia', metric: '↓ 80% atendimentos manuais', text: 'Meus agendamentos agora acontecem 100% via WhatsApp sem eu precisar tocar no celular.' },
              { name: 'Cláudia Lima', role: 'Gerente Comercial', metric: '+ 45% taxa de conversão', text: 'A IA responde instantaneamente e nunca perde um lead, mesmo em feriados ou de madrugada.' },
              { name: 'Dr. Lucas Mendes', role: 'Clínica Dentária', metric: '- 12h/semana da recepção', text: 'O atendimento de triagem ficou muito mais ágil. Minha secretária foca só em situações complexas.' },
            ].map((d, i) => (
              <Card key={i} className="group hover:-translate-y-2 p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-accent-green/20 text-accent-green' : i === 1 ? 'bg-accent-purple/20 text-accent-purple' : 'bg-orange-500/20 text-orange-500'}`}>
                    {d.name[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[14px] leading-none mb-1">{d.name}</h4>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest">{d.role}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm italic mb-8 leading-relaxed opacity-90">"{d.text}"</p>
                <div className="pt-6 border-t border-white/5 font-display font-black text-accent-green text-[13px] flex items-center gap-2">
                   <ChevronRight size={14} /> {d.metric}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL & FOOTER */}
      <section className="py-[120px] px-6">
        <div className="max-w-[900px] mx-auto premium-border p-12 md:p-24 text-center overflow-hidden">
            <div className="glow-green w-64 h-64 top-0 left-1/2 -translate-x-1/2 opacity-20" />
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 relative z-10 tracking-tighter">Pronto para automatizar seu atendimento?</h2>
            <p className="text-text-secondary text-lg md:text-xl mb-12 relative z-10 max-w-[500px] mx-auto italic font-medium">
              Join the 340+ businesses scaling their WhatsApp automation today.
            </p>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-16 px-12 text-lg font-black rounded-xl shadow-2xl shadow-accent-green/20 active:scale-95 group">
                  Criar conta gratuita 
                  <ArrowRight className="ml-3 transition-base group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mt-4">7 dias grátis · Sem cartão de crédito</p>
            </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 bg-bg-base">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 opacity-80 transition-base hover:opacity-100">
           <div className="flex flex-col items-center md:items-start gap-4">
              <Link href="/">
                <Image 
                  src="/Logo Soma2.png" 
                  alt="Somar.IA" 
                  width={100} 
                  height={32} 
                  className="h-8 w-auto object-contain brightness-0 invert opacity-80"
                />
              </Link>
              <p className="text-text-muted text-xs text-center md:text-left max-w-[300px] leading-relaxed font-medium">
                 Transformamos conversas repetitivas em atendimentos automatizados e escaláveis para o seu negócio.
              </p>
           </div>

           <div className="flex flex-wrap items-center justify-center gap-10 text-[13px] font-bold text-text-secondary uppercase tracking-widest">
              <Link href="#" className="hover:text-accent-green transition-base">Termos</Link>
              <Link href="#" className="hover:text-accent-green transition-base">Privacidade</Link>
              <Link href="/login" className="hover:text-accent-green transition-base">Painel</Link>
              <Link href="mailto:contato@somaria.ia" className="hover:text-accent-green transition-base">Suporte</Link>
           </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-6 text-center mt-20">
           <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.3em]">© 2025 Somar.IA · São Paulo, Brasil</p>
        </div>
      </footer>
    </div>
  );
}
