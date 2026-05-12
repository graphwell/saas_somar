'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type UserRow = {
  id: string;
  name: string;
  email: string;
  subscription: { planType: string; status: string } | null;
  instances: { id: string }[];
};

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const plan = u.subscription?.planType ?? 'trial';
      const matchPlan = filterPlan === 'all' || plan === filterPlan;
      const status = u.subscription?.status ?? 'none';
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [users, search, filterPlan, filterStatus]);

  const statusIcon = (status: string | undefined) => {
    if (status === 'active') return <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00E5A0] uppercase tracking-tighter"><CheckCircle2 size={12} /> Ativo</div>;
    if (status === 'canceled') return <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#EF4444] uppercase tracking-tighter"><XCircle size={12} /> Cancelado</div>;
    return <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#F59E0B] uppercase tracking-tighter"><AlertCircle size={12} /> Trial</div>;
  };

  const planBadge = (planType: string | undefined) => {
    if (planType === 'pro') return <Badge variant="green">PRO</Badge>;
    if (planType === 'starter') return <Badge variant="amber">STARTER</Badge>;
    return <Badge variant="gray">TRIAL</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Gestão de Usuários</h2>
          <p className="text-[#9CA3AF] mt-1">Visualize e gerencie todos os clientes da plataforma Somar.IA.</p>
        </div>
      </div>

      <Card className="p-0 border-white/5 overflow-hidden">
        {/* Filtros */}
        <div className="p-5 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value)}
              className="bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base"
            >
              <option value="all">Todos os Planos</option>
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                  <span className="flex items-center gap-2">Usuário <ArrowUpDown size={10} /></span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Plano</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Instâncias</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 size={28} className="animate-spin text-[#6C5DD3] mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#6B7280] text-sm">
                    {users.length === 0 ? 'Nenhum usuário cadastrado.' : 'Nenhum resultado para os filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-base group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3] font-bold text-xs">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#00E5A0] transition-colors">{user.name}</p>
                          <p className="text-[10px] text-[#6B7280]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{planBadge(user.subscription?.planType)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">{statusIcon(user.subscription?.status)}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-[#9CA3AF]">
                      {user.instances.length} {user.instances.length === 1 ? 'instância' : 'instâncias'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/agente?targetUserId=${user.id}`}>
                          <Button variant="ghost" size="sm" className="p-2 hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3]">
                            <Shield size={14} />
                          </Button>
                        </a>
                        <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10">
                          <MoreVertical size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-[#6B7280] font-bold">
            {loading ? '—' : `MOSTRANDO ${filtered.length} DE ${users.length} USUÁRIOS`}
          </span>
        </div>
      </Card>
    </div>
  );
}
