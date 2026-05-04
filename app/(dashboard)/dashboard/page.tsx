"use client";

import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Zap, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  TrendingUp,
  Smile,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const data = [
  { name: 'Seg', msgs: 400, conv: 240 },
  { name: 'Ter', msgs: 300, conv: 139 },
  { name: 'Qua', msgs: 200, conv: 980 },
  { name: 'Qui', msgs: 278, conv: 390 },
  { name: 'Sex', msgs: 189, conv: 480 },
  { name: 'Sab', msgs: 239, conv: 380 },
  { name: 'Dom', msgs: 349, conv: 430 },
];

export default function DashboardPage() {
  const [status, setStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/user/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E5A0]"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alerta de Reconexão (Upgrade) */}
      {status?.needsReconnect && (
        <Card className="bg-amber-500/10 border-amber-500/30 p-4 border-dashed animate-pulse">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                 <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                 <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Reconexão Obrigatória</h4>
                 <p className="text-[11px] text-amber-100/70 mt-0.5 leading-relaxed">
                    Seu plano foi ativado com sucesso! Por favor, reconecte seu WhatsApp para começar a usar os recursos do seu plano PRO.
                 </p>
              </div>
              <Link href="/whatsapp">
                 <Button variant="ghost" size="sm" className="font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/20">
                    Reconectar Agora
                 </Button>
              </Link>
           </div>
        </Card>
      )}

      {/* Header com Contexto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-[#9CA3AF]">Olá! Acompanhe o desempenho da sua IA em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Badge variant={status?.status === 'connected' ? 'green' : 'amber'} className={`py-1 px-3 ${status?.status === 'connected' ? 'bg-[#00E5A0]/10 border-[#00E5A0]/20 text-[#00E5A0]' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
              {status?.status === 'connected' ? 'WHATSAPP CONECTADO' : 'AGUARDANDO CONEXÃO'}
           </Badge>
           <Link href="/agente">
             <Button size="sm" className="font-bold gap-2">
                <PlusCircle size={16} /> Configurar Agente
             </Button>
           </Link>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Mensagens (Mensal)" 
          value="1.284" 
          icon={<MessageSquare size={18} />} 
          trend={{ value: 12, isPositive: true }}
          className="hover:scale-[1.02] transition-transform"
        />
        {/* Trial Progress Bar */}
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
            <p className="text-[10px] text-[#6B7280] mt-3">
              Seu limite reseta amanhã à meia-noite.
            </p>
          </Card>
        ) : (
          <MetricCard 
            label="Conversas Ativas" 
            value="42" 
            icon={<Users size={18} />} 
            trend={{ value: 8, isPositive: true }}
            className="hover:scale-[1.02] transition-transform"
          />
        )}
        <MetricCard 
          label="Taxa de Resposta" 
          value="98.5%" 
          icon={<Zap size={18} />} 
          trend={{ value: 2, isPositive: true }}
          className="hover:scale-[1.02] transition-transform"
        />
        <MetricCard 
          label="Encurtamento Link" 
          value="12K" 
          icon={<Clock size={18} />} 
          className="hover:scale-[1.02] transition-transform"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Gráfico de Volume */}
        <Card className="lg:col-span-2 space-y-8 group relative overflow-hidden">
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#00E5A0]/10 flex items-center justify-center text-[#00E5A0]">
                    <TrendingUp size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold">Volume de Atendimento</h3>
                    <p className="text-xs text-[#6B7280]">Comparativo de mensagens vs conversas únicas</p>
                 </div>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base">
                 <option>Últimos 7 dias</option>
                 <option>Últimos 30 dias</option>
              </select>
           </div>

           <div className="h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5A0" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C5DD3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6C5DD3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="msgs" stroke="#00E5A0" strokeWidth={3} fillOpacity={1} fill="url(#colorMsgs)" />
                  <Area type="monotone" dataKey="conv" stroke="#6C5DD3" strokeWidth={3} fillOpacity={1} fill="url(#colorConv)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Análise de Sentimento (Polimento UX) */}
        <Card className="flex flex-col justify-between">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                    <Smile size={20} />
                 </div>
                 <h3 className="text-lg font-bold">Humor dos Clientes</h3>
              </div>
              
              <div className="space-y-4">
                 {[
                   { label: 'Satisfeito', value: 82, color: '#00E5A0' },
                   { label: 'Neutro', value: 15, color: '#F59E0B' },
                   { label: 'Frustrado', value: 3, color: '#EF4444' },
                 ].map((s) => (
                    <div key={s.label} className="space-y-2">
                       <div className="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
                          <span className="text-[#9CA3AF]">{s.label}</span>
                          <span className="text-white">{s.value}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-1000" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mt-8">
              <div className="flex gap-3">
                 <AlertCircle size={18} className="text-[#6C5DD3] shrink-0" />
                 <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
                    Sua IA está performando 15% melhor que a média na manutenção de clientes satisfeitos. Continue assim!
                 </p>
              </div>
           </div>
        </Card>
      </div>

      {/* Feed de Atividades Recentes ou Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Atividades Recentes</h3>
            <Link href="/conversas">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-white">
                Ver Todo Histórico
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-base cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF] group-hover:text-white transition-colors">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">Cliente #0492{i}</h4>
                    <p className="text-[11px] text-[#6B7280]">Manteve conversa por 4 minutos • Agendado</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </Card>

        {/* Lembretes / Sugestões (UX Polish) */}
        <div className="space-y-8">
           <Card className="bg-[#6C5DD3]/10 border-[#6C5DD3]/20 border-dashed flex flex-col items-center py-8 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#6C5DD3]/20 flex items-center justify-center text-[#6C5DD3]">
                 <Zap size={28} />
              </div>
              <div>
                 <h4 className="font-bold text-sm">Otimização Disponível</h4>
                 <p className="text-[11px] text-[#9CA3AF] mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Ajuste o tom de voz para "Amigável" e veja sua taxa de resposta subir.
                 </p>
              </div>
              <Link href="/agente">
                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-[#6C5DD3] border-[#6C5DD3]/30">
                   Ajustar Agora
                </Button>
              </Link>
           </Card>

           <Card className="bg-white/[0.01] border-white/5 py-6 px-4">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-[#00E5A0]" />
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Dica Somar.IA</h4>
               </div>
               <p className="text-[11px] text-[#6B7280] italic leading-loose">
                 "IA de alta performance não é apenas resposta, é conexão emocional. Revise suas regras de atendimento para humanizar o chatbot."
               </p>
           </Card>
        </div>
      </div>

    </div>
  );
}

