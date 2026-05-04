"use client";

import React from 'react';
import { 
  Users, 
  DollarSign, 
  Server, 
  TrendingUp, 
  ArrowUpRight, 
  Globe,
  Bell,
  Search
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
  Cell
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4200, users: 45 },
  { name: 'Fev', revenue: 5800, users: 62 },
  { name: 'Mar', revenue: 8900, users: 89 },
  { name: 'Abr', revenue: 14200, users: 154 },
];

const COLORS = ['#00E5A0', '#6C5DD3', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Master Admin
          </h2>
          <p className="text-[#9CA3AF]">Visão geral da saúde da plataforma Somar.IA.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
            <input 
               type="text" 
               placeholder="Buscar cliente..." 
               className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base w-64"
            />
          </div>
          <Button variant="ghost" size="sm" className="relative p-2 rounded-full border-white/10">
             <Bell size={20} />
             <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
          </Button>
        </div>
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="MRR (Receita)" 
          value="R$ 14.200" 
          icon={<DollarSign size={18} />} 
          trend={{ value: 24, isPositive: true }}
        />
        <MetricCard 
          label="Total Usuários" 
          value="342" 
          icon={<Users size={18} />} 
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard 
          label="Instâncias Ativas" 
          value="489" 
          icon={<Server size={18} />} 
        />
        <MetricCard 
          label="Taxa de Churn" 
          value="1.2%" 
          icon={<TrendingUp size={18} />} 
          trend={{ value: 0.2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Growth */}
        <Card className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-bold">Crescimento de Receita</h3>
                 <p className="text-xs text-[#6B7280]">Recorrência mensal acumulada (MRR)</p>
              </div>
              <Badge variant="green">ESTÁVEL</Badge>
           </div>

           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                    <Tooltip 
                       cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                       contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                       {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#00E5A0' : '#1F2937'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* System Health */}
        <Card className="space-y-6">
           <h3 className="text-lg font-bold">Monitoramento Global</h3>
           
           <div className="space-y-6">
              {[
                { label: 'n8n Clusters', status: 'Online', health: 100, color: '#00E5A0' },
                { label: 'Wasender Nodes', status: 'Online', health: 98, color: '#00E5A0' },
                { label: 'API OpenAI', status: 'Lenta', health: 75, color: '#F59E0B' },
                { label: 'PostgreSQL DB', status: 'Online', health: 99, color: '#00E5A0' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase tracking-tighter">{item.label}</span>
                      <span className="text-[#6B7280]">{item.status}</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                         className="h-full transition-all duration-1000" 
                         style={{ width: `${item.health}%`, backgroundColor: item.color }} 
                      />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-8 pt-8 border-t border-white/5">
              <div className="bg-[#6C5DD3]/10 border border-[#6C5DD3]/20 rounded-xl p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Globe size={18} className="text-[#6C5DD3]" />
                    <span className="text-xs font-bold">Domínios Conectados</span>
                 </div>
                 <span className="text-xs font-black">1.240</span>
              </div>
           </div>
        </Card>
      </div>

      {/* Recent Users List */}
      <Card className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Novos Clientes</h3>
            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
               Ver Base Total
            </Button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                     <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Empresa</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Plano</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Data Adesão</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Barbearia do Jota', plan: 'PRO', date: 'Hoje, 14:20' },
                    { name: 'Clínica Sorriso', plan: 'ENTERPRISE', date: 'Ontem, 16:05' },
                    { name: 'PetShop Amigão', plan: 'FREE', date: 'Ontem, 09:12' },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-base group">
                       <td className="px-6 py-4 text-xs font-bold text-white">{u.name}</td>
                       <td className="px-6 py-4">
                          <Badge variant={u.plan === 'ENTERPRISE' ? 'amber' : u.plan === 'PRO' ? 'green' : 'gray'}>
                             {u.plan}
                          </Badge>
                       </td>
                       <td className="px-6 py-4 text-xs text-[#9CA3AF]">{u.date}</td>
                       <td className="px-6 py-4 text-center">
                          <button className="text-[10px] font-bold text-[#00E5A0] hover:underline uppercase tracking-widest">
                             Detalhes <ArrowUpRight size={10} className="inline ml-1" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

    </div>
  );
}

