import React from 'react';
import { Server, ShieldCheck, Plus, Link as LinkIcon, UserPlus, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import PoolClient, { PoolActions } from './PoolClient';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function AdminPoolPage() {
  const instances = await prisma.whatsAppInstance.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true, name: true, email: true }
  });

  const totalInstances = instances.length;
  const inUse = instances.filter(i => i.userId).length;
  const available = totalInstances - inUse;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Pool de Instâncias</h2>
          <p className="text-[#9CA3AF]">Gerencie o estoque de conexões para demonstração e trials.</p>
        </div>
        
        <PoolClient users={users} instances={instances} />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Total no Pool" 
          value={totalInstances.toString()} 
          icon={<Server size={18} />} 
        />
        <MetricCard 
          label="Sendo Usadas" 
          value={inUse.toString()} 
          icon={<UserPlus size={18} />} 
          className="border-[#6C5DD3]/20"
        />
        <MetricCard 
          label="Disponíveis" 
          value={available.toString()} 
          icon={<ShieldCheck size={18} />} 
          className="border-[#00E5A0]/20"
        />
      </div>

      <Card className="p-0 border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Instância / Prov</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Token / Webhook</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Atribuída a</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {instances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6B7280] text-sm">
                    Nenhuma instância cadastrada no pool.
                  </td>
                </tr>
              ) : (
                instances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-white/[0.01] transition-base group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">{inst.instanceKey}</span>
                        <span className="text-[10px] text-[#6B7280] uppercase font-bold">{inst.provider}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-[200px]">
                        <span className="text-[10px] font-mono text-[#9CA3AF] truncate">{inst.token}</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-[#6B7280] truncate">
                           <LinkIcon size={10} /> Propagado pelo Next.js
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <Badge variant={inst.status === 'connected' ? 'green' : 'gray'}>
                          {inst.status === 'connected' ? 'conectada' : 'pronta'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {inst.user ? (
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3] text-[10px] font-bold">
                              {inst.user.name.charAt(0)}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{inst.user.name}</span>
                              <span className="text-[9px] text-[#6B7280]">{inst.user.email}</span>
                           </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Livre</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <PoolActions instanceId={inst.id} isAssigned={!!inst.userId} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-[#6C5DD3]/10 border-[#6C5DD3]/20 flex gap-4 p-6">
         <ShieldCheck className="text-[#6C5DD3] shrink-0" size={24} />
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Gestão Segura de Webhooks</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
               As instâncias do pool enviam dados para o endpoint <code>/api/whatsapp/webhook</code>. 
               O roteamento entre usuários é feito automaticamente pelo sistema com base no Instance ID.
            </p>
         </div>
      </Card>

    </div>
  );
}

