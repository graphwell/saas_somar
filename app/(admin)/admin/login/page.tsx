'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'ADMIN') {
      const callback = searchParams.get('callbackUrl') ?? '/admin/dashboard';
      router.replace(callback);
    }
  }, [status, session, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    try {
      const res = await signIn('credentials', { email, password, redirect: false });

      if (res?.error) {
        setError('Credenciais inválidas.');
        setIsLoading(false);
        return;
      }

      const sessionRes = await fetch('/api/auth/session');
      const updatedSession = await sessionRes.json();

      if (updatedSession?.user?.role !== 'ADMIN') {
        setError('Acesso negado. Área exclusiva para administradores.');
        setIsLoading(false);
        return;
      }

      const callback = searchParams.get('callbackUrl') ?? '/admin/dashboard';
      router.replace(callback);
    } catch {
      setError('Erro ao tentar acessar. Tente novamente.');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#EF4444]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060910] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/5 via-transparent to-[#6C5DD3]/5 pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-[#EF4444] opacity-[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-[#6C5DD3] opacity-[0.05] blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mb-5 shadow-lg shadow-[#EF4444]/10">
            <ShieldAlert size={28} className="text-[#EF4444]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Acesso Restrito</h1>
          <p className="text-[#6B7280] text-sm mt-1.5 text-center">
            Área exclusiva para administradores da plataforma.
          </p>
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="E-mail Admin"
              name="email"
              type="email"
              placeholder="admin@somar.ia"
              required
              icon={<Mail size={16} />}
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="Senha"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                icon={<Lock size={16} />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-[#6B7280] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium px-4 py-3 rounded-xl">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold shadow-lg shadow-[#EF4444]/20 mt-2"
              isLoading={isLoading}
              size="lg"
            >
              {isLoading ? 'Verificando...' : 'Acessar Painel'}
            </Button>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-[#6B7280] font-medium uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
            Zona de acesso monitorado
          </div>
          <a href="/login" className="text-xs text-[#6B7280] hover:text-white transition-colors">
            ← Voltar ao login de usuário
          </a>
        </div>
      </div>
    </div>
  );
}
