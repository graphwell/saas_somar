"use client";

import React from 'react';
import {
  MessageSquare,
  Users,
  Zap,
  ArrowUpRight,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

type DashStats = {
  totalCustomers: number;
  activeSessions: number;
  messagesUsed: number;
  messagesLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  planType: string;
  periodEnd: string | null;
  recentSessions: {
    id: string;
    status: string;
    customer: { name: string | null; phone: string };
    messages: { content: string; createdAt: string }[];
  }[];
  weeklyData: { name: string; msgs: number; respostas: number }[];
};

type WhatsappStatus = {
  plan: string;
  status: string;
  messagesSentToday: number;
  needsReconnect: boolean;
};

export default function DashboardPage() {
  const [status, setStatus] = React.useState<WhatsappStatus | null>(null);
  const [stats, setStats] = React.useState<DashStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/user/status').then(r => r.json()).catch(() => null),
      fetch('/api/user/dashboard-stats').then(r => r.json()).catch(() => null),
    ]).then(([s, d]) => {
      setStatus(s);
      setStats(d);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 size={32} className="animate-spin text-[#00E5A0]" />
    </div>
  );

  const msgPct = stats ? Math.min(Math.round((stats.messagesUsed / stats.messagesLimit) * 100), 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alerta de reconexão */}
      {status?.needsReconnect && (
        <Card className="bg-amber-500/10 border-amber-500/30 p-4 border-dashed animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Reconexão Obrigatória</h4>
              <p className="text-[11px] text-amber-100/70 mt-0.5 leading-relaxed">
                Seu plano foi ativado! Reconecte seu WhatsApp para usar os recursos do plano PRO.
              </p>
            </div>
            <Link href="/whatsapp">
              <Button variant="ghost" size="sm" className="font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/20">
                Reconectar
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-[#9CA3AF] mt-1">Acompanhe o desempenho da sua IA em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={status?.status === 'IN_USE' ? 'green' : 'amber'}
            className="py-1 px-3"
          >
            {status?.status === 'IN_USE' ? 'WHATSAPP CONECTADO' : 'AGUARDANDO CONEXÃO'}
          </Badge>
          <Link href="/agente">
            <Button size="sm" className="font-bold gap-2">
              <PlusCircle size={16} /> Configurar Agente
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Mensagens Usadas"
          value={String(stats?.messagesUsed ?? 0)}
          icon={<MessageSquare size={18} />}
          className="hover:scale-[1.02] transition-transform"
        />
        {status?.plan === 'trial' ? (
          <Card className="p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform bg-white/[0.02]">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
              <span>Limite Diário (Trial)</span>
              <span className={status.messagesSentToday >= 80 ? 'text-amber-500' : ''}>
                {status.messagesSentToday} / 100
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${status.messagesSentToday >= 80 ? 'bg-amber-500' : 'bg-[#00E5A0]'}`}
                style={{ width: `${Math.min((status.messagesSentToday / 100) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#6B7280] mt-3">Limite reseta à meia-noite.</p>
          </Card>
        ) : (
          <MetricCard
            label="Sessões Ativas"
            value={String(stats?.activeSessions ?? 0)}
            icon={<Users size={18} />}
            className="hover:scale-[1.02] transition-transform"
          />
        )}
        <MetricCard
          label="Clientes no Sistema"
          value={String(stats?.totalCustomers ?? 0)}
          icon={<Zap size={18} />}
          className="hover:scale-[1.02] transition-transform"
        />
        <Card className="p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform bg-white/[0.02]">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
            <span>Uso do Plano</span>
            <span className={msgPct >= 80 ? 'text-amber-500' : 'text-[#00E5A0]'}>{msgPct}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${msgPct >= 80 ? 'bg-amber-500' : 'bg-[#6C5DD3]'}`}
              style={{ width: `${msgPct}%` }}
            />
          </div>
          <p className="text-[10px] text-[#6B7280] mt-3">
            {stats?.messagesUsed ?? 0} de {stats?.messagesLimit ?? 100} mensagens
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico real: últimos 7 dias */}
        <Card className="lg:col-span-2 space-y-8 group relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00E5A0]/10 flex items-center justify-center text-[#00E5A0]">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Volume de Atendimento</h3>
                <p className="text-xs text-[#6B7280]">Mensagens recebidas vs respostas da IA — últimos 7 dias</p>
              </div>
            </div>
          </div>

          {(!stats?.weeklyData || stats.weeklyData.every(d => d.msgs === 0 && d.respostas === 0)) ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center gap-3 opacity-50">
              <MessageSquare size={36} className="text-[#6B7280]" />
              <p className="text-sm text-[#6B7280]">Nenhuma mensagem nos últimos 7 dias.</p>
              <p className="text-xs text-[#6B7280]">Os dados aparecerão aqui conforme o fluxo de atendimento começar.</p>
            </div>
          ) : (
            <div className="h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyData}>
                  <defs>
                    <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRespostas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C5DD3" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6C5DD3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(v, name) => [v, name === 'msgs' ? 'Recebidas' : 'Respondidas']}
                  />
                  <Area type="monotone" dataKey="msgs" stroke="#00E5A0" strokeWidth={3} fillOpacity={1} fill="url(#colorMsgs)" />
                  <Area type="monotone" dataKey="respostas" stroke="#6C5DD3" strokeWidth={3} fillOpacity={1} fill="url(#colorRespostas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Tokens */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Consumo de Tokens</h3>
            <div className="space-y-4">
              {[
                {
                  label: 'Mensagens',
                  used: stats?.messagesUsed ?? 0,
                  limit: stats?.messagesLimit ?? 100,
                  color: '#00E5A0',
                },
                {
                  label: 'Tokens IA',
                  used: stats?.tokensUsed ?? 0,
                  limit: stats?.tokensLimit ?? 100000,
                  color: '#6C5DD3',
                },
              ].map(s => {
                const pct = Math.min(Math.round((s.used / s.limit) * 100), 100);
                return (
                  <div key={s.label} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
                      <span className="text-[#9CA3AF]">{s.label}</span>
                      <span className="text-white">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                    <p className="text-[10px] text-[#6B7280]">{s.used.toLocaleString('pt-BR')} de {s.limit.toLocaleString('pt-BR')}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mt-6">
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-[#6C5DD3] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
                Plano atual: <strong className="text-white capitalize">{stats?.planType ?? '—'}</strong>
                {stats?.periodEnd && (
                  <> · Renova em <strong className="text-white">{new Date(stats.periodEnd).toLocaleDateString('pt-BR')}</strong></>
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Atividades recentes reais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Atividades Recentes</h3>
            <Link href="/conversas">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-white">
                Ver Histórico
              </Button>
            </Link>
          </div>

          {!stats?.recentSessions || stats.recentSessions.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center opacity-50">
              <Users size={36} className="text-[#6B7280]" />
              <p className="text-sm text-[#6B7280]">Nenhuma conversa ainda.</p>
              <p className="text-xs text-[#6B7280]">As atividades aparecerão aqui quando clientes enviarem mensagens.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentSessions.map(sess => (
                <Link key={sess.id} href="/conversas">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-base cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF] group-hover:text-white transition-colors font-bold text-sm">
                        {(sess.customer.name ?? sess.customer.phone).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{sess.customer.name ?? sess.customer.phone}</h4>
                        <p className="text-[11px] text-[#6B7280] truncate max-w-[300px]">
                          {sess.messages[0]?.content ?? 'Sem mensagens'}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="bg-[#6C5DD3]/10 border-[#6C5DD3]/20 border-dashed flex flex-col items-center py-8 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#6C5DD3]/20 flex items-center justify-center text-[#6C5DD3]">
              <Zap size={28} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Configure seu Agente</h4>
              <p className="text-[11px] text-[#9CA3AF] mt-1 max-w-[200px] mx-auto leading-relaxed">
                Personalize o prompt e o comportamento da sua IA para melhores resultados.
              </p>
            </div>
            <Link href="/agente">
              <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-[#6C5DD3] border-[#6C5DD3]/30">
                Ajustar Agente
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
