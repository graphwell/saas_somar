"use client";

import React from 'react';
import { 
  CreditCard, 
  Check, 
  ArrowUpCircle, 
  History, 
  Download, 
  Layout, 
  MessageSquare, 
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const billingHistory = [
  { id: 'INV-004', date: '01 Abr, 2025', status: 'Pago', method: '•••• 4242', amount: 'R$ 197,00' },
  { id: 'INV-003', date: '01 Mar, 2025', status: 'Pago', method: '•••• 4242', amount: 'R$ 197,00' },
  { id: 'INV-002', date: '01 Fev, 2025', status: 'Pago', method: '•••• 4242', amount: 'R$ 197,00' },
  { id: 'INV-001', date: '02 Jan, 2025', status: 'Pago', method: 'Boleto', amount: 'R$ 197,00' },
];

export default function PlanoPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Assinatura e Uso
        </h2>
        <p className="text-[#9CA3AF]">Gerencie seu plano, faturamento e acompanhe seus limites.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Plan & Usage */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layout size={120} />
             </div>
             <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-white">Plano Pro</h3>
                      <Badge variant="green" className="animate-pulse">ATIVO</Badge>
                   </div>
                   <p className="text-[#9CA3AF] text-sm max-w-md">
                      Sua assinatura PRO está ativa e renova automaticamente em <strong>01 de Maio, 2025</strong>. 
                   </p>
                   <div className="flex items-center gap-6 pt-2">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest leading-none">Valor Mensal</span>
                          <span className="text-lg font-bold text-white">R$ 197,00</span>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest leading-none">Método de Pgto</span>
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                             <CreditCard size={14} className="text-[#6C5DD3]" /> Visa •••• 4242
                          </span>
                       </div>
                   </div>
                </div>
                <Button className="font-bold border-[#00E5A0]/20 text-[#00E5A0] hover:bg-[#00E5A0]/10" variant="ghost"> Alternar Plano </Button>
             </div>
          </Card>

          {/* Progress Bars Usage */}
          <Card className="space-y-8">
             <div className="flex items-center gap-2">
                <Zap size={18} className="text-[#00E5A0]" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-white">Consumo do Mês</h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Progress 1 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-bold text-white">Mensagens</span>
                       <span className="text-[10px] text-[#6B7280]">1.284 de 5.000 enviadas</span>
                    </div>
                    <span className="text-xs font-bold text-[#00E5A0]">25%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#00E5A0] w-[25%] shadow-[0_0_10px_rgba(0,229,160,0.5)]" />
                  </div>
                </div>

                {/* Progress 2 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-bold text-white">Instâncias</span>
                       <span className="text-[10px] text-[#6B7280]">1 de 3 conectadas</span>
                    </div>
                    <span className="text-xs font-bold text-[#6C5DD3]">33%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#6C5DD3] w-[33%] shadow-[0_0_10px_rgba(108,93,211,0.5)]" />
                  </div>
                </div>
             </div>
          </Card>

          {/* Billing History Table */}
          <Card className="p-0 border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <History size={18} className="text-[#6B7280]" />
                   <h4 className="font-bold text-sm">Histórico de Faturamento</h4>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-[#6B7280]"> Ver todas </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                         <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Fatura</th>
                         <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Data</th>
                         <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Status</th>
                         <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Valor</th>
                         <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Ação</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {billingHistory.map((bill) => (
                        <tr key={bill.id} className="hover:bg-white/[0.01] transition-base group">
                           <td className="px-6 py-4 text-xs font-bold text-white">{bill.id}</td>
                           <td className="px-6 py-4 text-xs text-[#9CA3AF]">{bill.date}</td>
                           <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-md bg-[#00E5A0]/10 text-[#00E5A0] text-[9px] font-bold uppercase tracking-widest">{bill.status}</span>
                           </td>
                           <td className="px-6 py-4 text-xs font-bold text-white">{bill.amount}</td>
                           <td className="px-6 py-4 text-center">
                              <button className="p-2 rounded-lg hover:bg-white/5 text-[#6B7280] hover:text-white transition-base">
                                 <Download size={14} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
          </Card>
        </div>

        {/* Upgrade / Lateral Info Column */}
        <div className="space-y-8">
           <Card className="bg-[#00E5A0]/10 border-[#00E5A0]/20 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                 <ArrowUpCircle size={24} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-lg font-bold text-white">Upgrade para Enterprise</h3>
                 <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Precisa de limites ilimitados de mensagens ou suporte dedicado 24/7?
                 </p>
              </div>
              <ul className="space-y-3">
                 {['Instâncias Ilimitadas', 'Webhooks Customizados', 'SLA Garantido'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[10px] text-white font-medium">
                       <Check size={12} className="text-[#00E5A0]" /> {f}
                    </li>
                 ))}
              </ul>
              <Button className="w-full font-bold bg-[#00E5A0] text-[#0A0F1E] shadow-lg shadow-[#00E5A0]/20">
                 Falar com Vendas
              </Button>
           </Card>

           <Card className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3]">
                    <Clock size={16} />
                 </div>
                 <h4 className="font-bold text-sm">Informações Úteis</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Próxima Cobrança</span>
                    <span className="text-xs text-white">01 de Maio de 2025</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Ciclo</span>
                    <span className="text-xs text-white">Mensal</span>
                 </div>
                 <button className="text-[10px] uppercase font-bold tracking-widest text-[#6B7280] hover:text-white transition-colors flex items-center gap-2">
                    Alterar Dados de Cobrança <ExternalLink size={10} />
                 </button>
              </div>
           </Card>
        </div>
      </div>

    </div>
  );
}

