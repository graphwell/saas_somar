'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert, Mail, Lock, Eye, EyeOff,
  AlertTriangle, Loader2, Terminal, Activity,
  Server, Users, Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ──────────────────────────────────
// Relógio em tempo real
// ──────────────────────────────────
function Clock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR'));
      setDate(now.toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono">
      <div className="text-4xl font-black text-white tracking-widest tabular-nums">{time}</div>
      <div className="text-xs text-[#6B7280] mt-1 capitalize">{date}</div>
    </div>
  );
}

// ──────────────────────────────────
// Terminal animado de boot
// ──────────────────────────────────
const BOOT_LINES = [
  '> Inicializando Somar Admin Console...',
  '> Conectando ao banco de dados PostgreSQL...',
  '> Carregando módulos de segurança...',
  '> Verificando integridade do sistema...',
  '> Sistema operacional. Aguardando autenticação.',
];

function BootTerminal() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setLines(prev => [...prev, BOOT_LINES[i]]);
      i++;
      if (i >= BOOT_LINES.length) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[11px] space-y-1.5 min-h-[130px]">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 ${i === lines.length - 1 ? 'text-[#00E5A0]' : 'text-[#6B7280]'}`}
        >
          <span className="opacity-40 shrink-0">{String(i + 1).padStart(2, '0')}</span>
          <span>{line}</span>
        </div>
      ))}
      {lines.length === BOOT_LINES.length && (
        <span className="inline-block w-2 h-3 bg-[#EF4444] animate-pulse mt-1" />
      )}
    </div>
  );
}

// ──────────────────────────────────
// Formulário — usa useSearchParams
// (precisa estar dentro de <Suspense>)
// ──────────────────────────────────
function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'ADMIN') {
      router.replace(searchParams.get('callbackUrl') ?? '/admin/dashboard');
    }
  }, [status, session, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);

    try {
      const res = await signIn('credentials', {
        email: fd.get('email') as string,
        password: fd.get('password') as string,
        redirect: false,
      });

      if (res?.error) {
        setError('Credenciais inválidas.');
        setIsLoading(false);
        return;
      }

      const s = await fetch('/api/auth/session').then(r => r.json());
      if (s?.user?.role !== 'ADMIN') {
        setError('Acesso negado. Área exclusiva para administradores.');
        setIsLoading(false);
        return;
      }

      router.replace(searchParams.get('callbackUrl') ?? '/admin/dashboard');
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl p-7 shadow-2xl shadow-black/40 space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="admin@somar.ia"
          required
          icon={<Mail size={15} />}
          autoComplete="username"
        />

        <div className="relative">
          <Input
            label="Senha"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            icon={<Lock size={15} />}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-[#6B7280] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium px-4 py-3 rounded-xl">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full bg-[#EF4444] hover:bg-[#dc2626] text-white font-bold shadow-lg shadow-[#EF4444]/25"
          isLoading={isLoading}
        >
          {isLoading ? 'Autenticando...' : 'Entrar no Painel'}
        </Button>
      </form>
    </div>
  );
}

// ──────────────────────────────────
// Página principal
// ──────────────────────────────────
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex bg-[#060910]">

      {/* Painel Esquerdo — Console */}
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden bg-[#080C18] border-r border-white/5 p-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#EF4444] opacity-[0.04] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#6C5DD3] opacity-[0.05] blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center">
              <ShieldAlert size={15} className="text-[#EF4444]" />
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-widest uppercase">Somar.IA</p>
              <p className="text-[9px] text-[#EF4444] font-bold tracking-[0.3em] uppercase">Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-widest">Monitorado</span>
          </div>
        </div>

        <div className="relative z-10 mb-10"><Clock /></div>

        <div className="relative z-10 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={13} className="text-[#6B7280]" />
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Sistema</span>
          </div>
          <BootTerminal />
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { icon: Server, label: 'Servidor', value: 'Online', color: '#00E5A0' },
            { icon: Wifi, label: 'Conexão', value: 'Segura', color: '#00E5A0' },
            { icon: Activity, label: 'Ambiente', value: 'Produção', color: '#F59E0B' },
            { icon: Users, label: 'Acesso', value: 'Restrito', color: '#EF4444' },
          ].map(item => (
            <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
              <item.icon size={14} style={{ color: item.color }} className="shrink-0" />
              <div>
                <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-widest">{item.label}</p>
                <p className="text-xs font-bold text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-auto pt-8 border-t border-white/5">
          <p className="text-[10px] text-[#6B7280] font-mono">
            © {new Date().getFullYear()} Somar.IA · Acesso restrito e monitorado
          </p>
        </div>
      </div>

      {/* Painel Direito — Formulário */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#EF4444] opacity-[0.04] blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 mb-6">
              <ShieldAlert size={12} className="text-[#EF4444]" />
              <span className="text-[10px] font-black text-[#EF4444] uppercase tracking-widest">Acesso Restrito</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
              Painel<br />
              <span className="text-[#EF4444]">Administrativo</span>
            </h1>
            <p className="text-sm text-[#6B7280] mt-3">
              Autentique-se com suas credenciais de administrador.
            </p>
          </div>

          {/* Formulário envolto em Suspense por causa do useSearchParams */}
          <Suspense fallback={
            <div className="bg-[#111827] border border-white/5 rounded-2xl p-7 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#EF4444]" />
            </div>
          }>
            <AdminLoginForm />
          </Suspense>

          <div className="mt-6 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={13} className="text-[#EF4444] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
              Esta área é monitorada. Tentativas de acesso não autorizado são registradas e podem resultar em bloqueio permanente.
            </p>
          </div>

          <div className="mt-6 text-center">
            <a href="/login" className="text-xs text-[#6B7280] hover:text-white transition-colors">
              ← Voltar ao login de usuário
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
