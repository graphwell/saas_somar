"use client";

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const mockLogs = [
  { id: '1', time: '21:20:05', instance: 'somar_pro_10', event: 'Mensagem Recebida', status: 'success', detail: 'De: +55119988... | "Quero agendar"' },
  { id: '2', time: '21:19:42', instance: 'somar_trial_02', event: 'Encaminhado n8n', status: 'success', detail: 'Workflow: Master Flow v1.0 | OK (200)' },
  { id: '3', time: '21:18:15', instance: 'somar_pro_05', event: 'Erro Roteamento', status: 'error', detail: 'Instância não encontrada no banco.' },
  { id: '4', time: '21:15:30', instance: 'somar_pro_12', event: 'IA Resposta', status: 'success', detail: 'Enviado para WhatsApp | Provedor: UltraMsg' },
];

export default function LogsAdminPage() {
  const [logs, setLogs] = useState(mockLogs);
  const [isLive, setIsLive] = useState(true);

  // Simular logs em tempo real
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const newLog = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        instance: 'somar_live_db',
        event: 'Webhook Inbound',
        status: 'success',
        detail: 'Processado automaticamente pelo Roteador Central'
      };
      setLogs(prev => [newLog, ...prev.slice(0, 9)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Live Logs</h2>
            <Badge variant="green" className="animate-pulse">AO VIVO</Badge>
          </div>
          <p className="text-[#9CA3AF]">Monitoramento global de eventos e tráfego de mensagens.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsLive(!isLive)}
            className={`font-bold gap-2 ${isLive ? 'text-[#00E5A0]' : 'text-[#6B7280]'}`}
          >
            <Activity size={16} className={isLive ? 'animate-spin' : ''} /> {isLive ? 'Pausar Live' : 'Retomar Live'}
          </Button>
          <Button size="sm" className="font-bold gap-2 bg-[#EF4444] hover:bg-[#EF4444]/80">
            Limpar Console
          </Button>
        </div>
      </div>

      <Card className="p-0 border-white/5 bg-black/40 overflow-hidden shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
           <Terminal size={18} className="text-[#6B7280]" />
           <div className="flex-1 flex items-center gap-4 text-[10px] font-mono text-[#6B7280] uppercase tracking-widest">
              <span>Console da Plataforma</span>
              <span className="opacity-20">|</span>
              <span>Kernel: Somar-Router-v1</span>
           </div>
        </div>

        <div className="flex flex-col divide-y divide-white/5 font-mono text-[11px] leading-relaxed overflow-x-auto">
           {logs.map((log) => (
             <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-6 group">
                <span className="text-[#6B7280] shrink-0 w-16">{log.time}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-[#9CA3AF] shrink-0">{log.instance}</span>
                <div className="flex items-center gap-2 shrink-0 w-32">
                   {log.status === 'success' ? <CheckCircle2 size={12} className="text-[#00E5A0]" /> : <XCircle size={12} className="text-[#EF4444]" />}
                   <span className={log.status === 'success' ? 'text-white' : 'text-[#EF4444]'}>{log.event}</span>
                </div>
                <ArrowRight size={10} className="text-white/10 group-hover:text-white/40 transition-colors" />
                <span className="text-[#9CA3AF] truncate">{log.detail}</span>
             </div>
           ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] font-bold text-[#6B7280]">
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Zap size={10} fill="currentColor" className="text-[#00E5A0]" /> 124 ms latência média</span>
              <span className="flex items-center gap-1"><Clock size={10} className="text-[#6C5DD3]" /> uptime: 100%</span>
           </div>
           <button className="hover:text-white transition-colors uppercase tracking-widest">Acessar Histórico Completo</button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-[#00E5A0]/20 bg-[#00E5A0]/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Taxa de Sucesso</h4>
            <div className="text-2xl font-black text-[#00E5A0]">99.8%</div>
            <p className="text-[10px] text-[#9CA3AF]">Mensagens roteadas sem erros nas últimas 24h.</p>
         </Card>
         <Card className="border-[#6C5DD3]/20 bg-[#6C5DD3]/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Tráfego Instantâneo</h4>
            <div className="text-2xl font-black text-[#6C5DD3]">4.2 msg/s</div>
            <p className="text-[10px] text-[#9CA3AF]">Pico de atividade registrado às 14:00.</p>
         </Card>
         <Card className="border-[#EF4444]/20 bg-[#EF4444]/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Falhas Críticas</h4>
            <div className="text-2xl font-black text-[#EF4444]">0</div>
            <p className="text-[10px] text-[#9CA3AF]">Nenhuma interrupção total de serviço detectada.</p>
         </Card>
      </div>

    </div>
  );
}

