"use client";

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Check,
  ArrowUpCircle,
  Layout,
  MessageSquare,
  Zap,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type Status = {
  plan: string;
  status: string;
  messagesSentToday: number;
  limit: number | string;
  expiresAt: string | null;
};

type DashStats = {
  messagesUsed: number;
  messagesLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  planType: string;
  periodEnd: string | null;
};

const planName: Record<string, string> = {
  trial: 'Trial Gratuito',
  starter: 'Plano Starter',
  pro: 'Plano Pro',
};

export default function PlanoPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/status').then(r => r.json()).catch(() => null),
      fetch('/api/user/dashboard-stats').then(r => r.json()).catch(() => null),
    ]).then(([s, d]) => {
      setStatus(s);
      setStats(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5A0]" />
      </div>
    );
  }

  const plan = stats?.planType ?? status?.plan ?? 'trial';
  const msgUsed = stats?.messagesUsed ?? 0;
  const msgLimit = stats?.messagesLimit ?? 100;
  const msgPct = Math.min(Math.round((msgUsed / msgLimit) * 100), 100);
  const tokUsed = stats?.tokensUsed ?? 0;
  const tokLimit = stats?.tokensLimit ?? 100000;
  const tokPct = Math.min(Math.round((tokUsed / tokLimit) * 100), 100);
  const periodEnd = stats?.periodEnd ?? status?.expiresAt;
  const isActive = status?.status === 'IN_USE' || plan !== 'trial';

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Assinatura e Uso</h2>
        <p className="text-[#9CA3AF] mt-1">Gerencie seu plano, faturamento e acompanhe seus limites.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Plano atual */}
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layout size={120} />
            </div>
            <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white">{planName[plan] ?? plan}</h3>
                  <Badge variant={isActive ? 'green' : 'gray'}>
                    {isActive ? 'ATIVO' : 'INATIVO'}
                  </Badge>
                </div>
                {periodEnd ? (
                  <p className="text-[#9CA3AF] text-sm max-w-md">
                    {plan === 'trial'
                      ? <>Seu período trial expira em <strong className="text-white">{new Date(periodEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.</>
                      : <>Assinatura ativa. Próxima renovação em <strong className="text-white">{new Date(periodEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.</>
                    }
                  </p>
                ) : (
                  <p className="text-[#9CA3AF] text-sm">Sem data de renovação registrada.</p>
                )}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest leading-none">Plano</span>
                    <span className="text-lg font-bold text-white capitalize">{plan}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest leading-none">Mensagens / Mês</span>
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#6C5DD3]" />
                      {msgLimit === 0 ? 'Ilimitado' : msgLimit.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              {plan === 'trial' && (
                <a href="/checkout">
                  <Button className="font-bold bg-[#00E5A0] text-[#0A0F1E] hover:bg-[#00E5A0]/90">
                    Fazer Upgrade
                  </Button>
                </a>
              )}
            </div>
          </Card>

          {/* Barras de consumo reais */}
          <Card className="space-y-8">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#00E5A0]" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-white">Consumo do Mês</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">Mensagens</span>
                    <span className="text-[10px] text-[#6B7280]">
                      {msgUsed.toLocaleString('pt-BR')} de {msgLimit.toLocaleString('pt-BR')} enviadas
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${msgPct >= 80 ? 'text-amber-500' : 'text-[#00E5A0]'}`}>{msgPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${msgPct >= 80 ? 'bg-amber-500' : 'bg-[#00E5A0]'} shadow-[0_0_10px_rgba(0,229,160,0.5)]`}
                    style={{ width: `${msgPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">Tokens de IA</span>
                    <span className="text-[10px] text-[#6B7280]">
                      {tokUsed.toLocaleString('pt-BR')} de {tokLimit.toLocaleString('pt-BR')} usados
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${tokPct >= 80 ? 'text-amber-500' : 'text-[#6C5DD3]'}`}>{tokPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${tokPct >= 80 ? 'bg-amber-500' : 'bg-[#6C5DD3]'} shadow-[0_0_10px_rgba(108,93,211,0.5)]`}
                    style={{ width: `${tokPct}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Sem histórico de faturas real — encaminha ao Stripe */}
          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-[#6B7280]" />
              <h4 className="font-bold text-sm">Histórico de Faturamento</h4>
            </div>
            <div className="flex flex-col items-center gap-4 py-10 text-center opacity-60">
              <CreditCard size={36} className="text-[#6B7280]" />
              <div>
                <p className="text-sm text-white font-medium">Faturas disponíveis no portal Stripe</p>
                <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
                  Acesse o portal de faturamento para visualizar e baixar suas faturas, atualizar seu cartão ou cancelar a assinatura.
                </p>
              </div>
              <a href="/api/checkout/portal" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest gap-2">
                  Abrir Portal Stripe <ExternalLink size={12} />
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-8">
          <Card className="bg-[#00E5A0]/10 border-[#00E5A0]/20 flex flex-col gap-6">
            <div className="w-12 h-12 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
              <ArrowUpCircle size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                {plan === 'trial' ? 'Assine e Escale' : 'Upgrade para Pro'}
              </h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                {plan === 'trial'
                  ? 'Saia do trial e tenha mensagens ilimitadas, instâncias dedicadas e suporte prioritário.'
                  : 'Precisa de limites maiores ou suporte dedicado 24/7?'}
              </p>
            </div>
            <ul className="space-y-3">
              {['Mensagens Ilimitadas', 'Instância WaSender Exclusiva', 'Suporte Prioritário'].map(f => (
                <li key={f} className="flex items-center gap-2 text-[10px] text-white font-medium">
                  <Check size={12} className="text-[#00E5A0]" /> {f}
                </li>
              ))}
            </ul>
            <a href="/checkout">
              <Button className="w-full font-bold bg-[#00E5A0] text-[#0A0F1E] shadow-lg shadow-[#00E5A0]/20">
                {plan === 'trial' ? 'Assinar Agora' : 'Falar com Vendas'}
              </Button>
            </a>
          </Card>

          <Card className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3]">
                <Clock size={16} />
              </div>
              <h4 className="font-bold text-sm">Informações do Plano</h4>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Plano Atual</span>
                <span className="text-xs text-white capitalize">{planName[plan] ?? plan}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
                  {plan === 'trial' ? 'Expira em' : 'Próxima Cobrança'}
                </span>
                <span className="text-xs text-white">
                  {periodEnd
                    ? new Date(periodEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Ciclo</span>
                <span className="text-xs text-white">Mensal</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
