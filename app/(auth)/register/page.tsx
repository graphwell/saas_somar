"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmSenha: ""
  });

  const passwordStrength = useMemo(() => {
    const password = formData.senha;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  }, [formData.senha]);

  const strengthColor = useMemo(() => {
    if (passwordStrength <= 25) return "bg-[#EF4444]"; // Fraco
    if (passwordStrength <= 75) return "bg-[#F59E0B]"; // Médio
    return "bg-[#00E5A0]"; // Forte
  }, [passwordStrength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!acceptedTerms) {
      setError("Você deve aceitar os termos.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.");
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0F1E]">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00E5A0]/10 via-transparent to-[#6C5DD3]/10" />
        <div className="absolute top-[30%] right-[10%] w-96 h-96 bg-[#00E5A0] opacity-[0.05] blur-[120px]" />
        
        <div className="relative z-10 max-w-md">
          <Link href="/" className="text-7xl font-extrabold text-white mb-12 block tracking-tight">
            Somar<span className="text-[#00E5A0]">.IA</span>
          </Link>
          
          <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
            Comece a sua jornada <br />grátis agora.
          </h2>
          
          <div className="space-y-6">
            {[
              "Teste todas as ferramentas por 7 dias",
              "Sem precisar de cartão de crédito",
              "Configuração em menos de 5 minutos",
              "Crie seu assistente com personalidade"
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
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md p-8 sm:p-10 border-white/5 bg-white/[0.02]">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-white">Criar conta</h1>
              <Badge variant="amber">7 dias grátis</Badge>
            </div>
            <p className="text-[#6B7280]">Junte-se a centenas de empresas que automatizam vendas.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Nome completo"
              placeholder="Ex: João Silva"
              required
              icon={<User size={18} />}
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />

            <Input 
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />

            <div className="space-y-2">
              <div className="relative">
                <Input 
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  required
                  icon={<Lock size={18} />}
                  value={formData.senha}
                  onChange={e => setFormData({...formData, senha: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-[#6B7280] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {formData.senha && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-[#6B7280]">
                    <span>FORÇA DA SENHA</span>
                    <span>{passwordStrength}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${strengthColor}`} 
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input 
              label="Confirmar senha"
              type="password"
              placeholder="Repita sua senha"
              required
              icon={<ShieldCheck size={18} />}
              error={formData.confirmSenha && formData.senha !== formData.confirmSenha ? "As senhas não coincidem" : ""}
              value={formData.confirmSenha}
              onChange={e => setFormData({...formData, confirmSenha: e.target.value})}
            />

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer group pt-2">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#00E5A0] focus:ring-[#00E5A0]/20" 
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
              />
              <span className="text-xs text-[#9CA3AF] group-hover:text-white transition-colors leading-relaxed">
                Li e aceito os <Link href="#" className="text-[#00E5A0] hover:underline">Termos de Uso</Link> e a <Link href="#" className="text-[#00E5A0] hover:underline">Política de Privacidade</Link>
              </span>
            </label>

            <Button type="submit" size="lg" className="w-full font-bold text-base mt-2" isLoading={isLoading}>
              Criar conta grátis →
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-[#9CA3AF]">
            Já tem uma conta? <Link href="/login" className="text-[#00E5A0] font-bold hover:underline">Entrar →</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
