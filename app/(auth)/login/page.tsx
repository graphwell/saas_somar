"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        setError("E-mail ou senha inválidos.");
      } else {
        // Verifica o role para redirecionar corretamente
        const sessionRes = await fetch('/api/auth/session');
        const updatedSession = await sessionRes.json();
        if (updatedSession?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar entrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0F1E]">
      {/* Lado Esquerdo - Branding (Escondido em Mobile) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00E5A0]/10 via-transparent to-[#6C5DD3]/10" />
        <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-[#00E5A0] opacity-[0.1] blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-64 h-64 bg-[#6C5DD3] opacity-[0.1] blur-[100px]" />
        
        <div className="relative z-10 max-w-md">
          <Link href="/" className="mb-12 block hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="Somar.IA" className="h-28 w-auto object-contain drop-shadow-lg" />
          </Link>
          
          <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
            Bem-vindo de <br />volta ao futuro.
          </h2>
          
          <div className="space-y-6">
            {[
              "Sua IA respondendo 24h por dia",
              "Gestão simplificada de instâncias",
              "Acompanhe conversas em tempo real",
              "Cancelamento fácil a qualquer momento"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-[#9CA3AF]">
                <CheckCircle2 size={24} className="text-[#00E5A0] shrink-0" />
                <span className="text-lg font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 relative">
        <Card className="w-full max-w-md p-8 sm:p-10 border-white/5 bg-white/[0.02]">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Entrar</h1>
            <p className="text-[#6B7280]">Acesse sua conta para gerenciar seus agentes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="E-mail"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              icon={<Mail size={18} />}
            />

            <div className="relative">
              <Input 
                label="Senha"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                icon={<Lock size={18} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-[#6B7280] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#00E5A0] focus:ring-[#00E5A0]/20" />
                <span className="text-xs text-[#9CA3AF] group-hover:text-white transition-colors">Lembrar de mim</span>
              </label>
              <Link href="#" className="text-xs text-[#00E5A0] hover:underline font-medium">Esqueci minha senha</Link>
            </div>

            <Button type="submit" size="lg" className="w-full font-bold text-base" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0A0F1E] px-2 text-[#6B7280]">ou entre com</span></div>
          </div>

          <Button variant="ghost" className="w-full flex items-center gap-3 font-semibold bg-white text-black hover:bg-white/90">
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288c.708-2.127 2.692-3.708 5.036-3.708z" fill="#EA4335"/></svg>
            Google
          </Button>

          <p className="text-center mt-10 text-sm text-[#9CA3AF]">
            Não tem uma conta? <Link href="/register" className="text-[#00E5A0] font-bold hover:underline">Testar grátis →</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
