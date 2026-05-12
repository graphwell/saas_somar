'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Server,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type Stats = {
  totalUsers: number;
  activeInstances: number;
  idleInstances: number;
  paidSubscriptions: number;
  trialUsers: number;
  recentUsers: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    subscription: { planType: string; status: string } | null;
  }[];
  monthlySignups: { name: string; cadastros: number }[];
};

function planBadge(planType: string | undefined) {
  if (!planType || planType === 'trial') return <Badge variant="gray">TRIAL</Badge>;
  if (planType === 'pro') return <Badge variant="green">PRO</Badge>;
  return <Badge variant="amber">{planType.toUpperCase()}</Badge>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-[#6C5DD3]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-[#6B7280]">
        Erro ao carregar dados. Verifique a conexão com o banco.
      </div>
    );
  }

  const lastBar = stats.monthlySignups.length - 1;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Master Admin</h2>
        <p className="text-[#9CA3AF] mt-1">Visão geral da saúde da plataforma Somar.IA.</p>
      </div>

      {/* KPIs reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total de Usuários"
          value={String(stats.totalUsers)}
          icon={<Users size={18} />}
        />
        <MetricCard
          label="Assinantes Pagantes"
          value={String(stats.paidSubscriptions)}
          icon={<CheckCircle2 size={18} />}
        />
        <MetricCard
          label="Instâncias em Uso"
          value={String(stats.activeInstances)}
          icon={<Server size={18} />}
        />
        <MetricCard
          label="Instâncias Disponíveis"
          value={String(stats.idleInstances)}
          icon={<Server size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico real: novos cadastros por mês */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Novos Cadastros por Mês</h3>
              <p className="text-xs text-[#6B7280]">Últimos 6 meses</p>
            </div>
            <Badge variant="green">AO VIVO</Badge>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySignups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  formatter={(v) => [`${v} cadastros`, '']}
                />
                <Bar dataKey="cadastros" radius={[6, 6, 0, 0]}>
                  {stats.monthlySignups.map((_, i) => (
                    <Cell key={i} fill={i === lastBar ? '#00E5A0' : '#1F2937'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Resumo do Pool */}
        <Card className="space-y-5">
          <h3 className="text-lg font-bold">Pool de Instâncias</h3>
          <div className="space-y-4">
            {[
              { label: 'Em Uso', value: stats.activeInstances, color: '#00E5A0', pct: stats.activeInstances + stats.idleInstances > 0 ? Math.round((stats.activeInstances / (stats.activeInstances + stats.idleInstances)) * 100) : 0 },
              { label: 'Disponíveis', value: stats.idleInstances, color: '#6C5DD3', pct: stats.activeInstances + stats.idleInstances > 0 ? Math.round((stats.idleInstances / (stats.activeInstances + stats.idleInstances)) * 100) : 0 },
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white uppercase tracking-tighter">{item.label}</span>
                  <span className="text-[#6B7280]">{item.value} instâncias</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-1000" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280]">Trial</span>
              <span className="font-bold text-white">{stats.trialUsers} usuários</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280]">Pagantes</span>
              <span className="font-bold text-[#00E5A0]">{stats.paidSubscriptions} usuários</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280]">Conversão</span>
              <span className="font-bold text-white">
                {stats.totalUsers > 0 ? Math.round((stats.paidSubscriptions / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Novos Clientes reais */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Últimos Cadastros</h3>
          <a href="/admin/users">
            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              Ver Todos
            </Button>
          </a>
        </div>

        {stats.recentUsers.length === 0 ? (
          <p className="text-center text-[#6B7280] py-12">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Usuário</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Plano</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Cadastro</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-base group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3] font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-[#6B7280]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{planBadge(u.subscription?.planType)}</td>
                    <td className="px-6 py-4 text-xs text-[#9CA3AF] flex items-center gap-1.5">
                      <Clock size={11} className="text-[#6B7280]" />
                      {new Date(u.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a href={`/agente?targetUserId=${u.id}`} className="text-[10px] font-bold text-[#00E5A0] hover:underline uppercase tracking-widest">
                        Agente <ArrowUpRight size={10} className="inline ml-0.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
