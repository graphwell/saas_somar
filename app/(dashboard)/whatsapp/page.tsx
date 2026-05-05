'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone, CheckCircle2, AlertCircle,
  RefreshCcw, Loader2, ShieldCheck, MessageSquare, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function WhatsAppPage() {
  const [userStatus, setUserStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const r = await fetch('/api/user/status');
      if (!r.ok) throw new Error('Falha ao carregar status');
      const d = await r.json();
      setUserStatus(d);
    } catch (err) {
      setError('Erro ao carregar status do WhatsApp. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isConnected = userStatus?.status === 'IN_USE';
  const hasInstance = !!userStatus?.instanceKey;

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-[#6C5DD3]" />
        <p className="text-[#6B7280]">Verificando conexão WhatsApp...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Conexão WhatsApp</h2>
          <p className="text-[#9CA3AF] mt-1">Status da sua instância gerenciada.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchStatus} isLoading={isLoading}>
          <RefreshCcw size={14} className="mr-2" /> Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 items-center">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Principal */}
        <Card className={`lg:col-span-2 border-l-4 ${isConnected ? 'border-l-[#00E5A0]' : 'border-l-[#6B7280]'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-[#00E5A0]/10 text-[#00E5A0]' : 'bg-white/5 text-[#6B7280]'}`}>
              <Smartphone size={28} />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">Instância WhatsApp</h3>
              <div className="flex items-center gap-2 mt-1.5">
                {isConnected
                  ? <Badge variant="green" className="animate-pulse">● ATIVO</Badge>
                  : hasInstance
                    ? <Badge variant="gray">● CONFIGURANDO</Badge>
                    : <Badge variant="red">● SEM INSTÂNCIA</Badge>
                }
                <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
                  {userStatus?.plan?.toUpperCase() || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Provedor</div>
              <div className="text-sm font-bold text-white">{userStatus?.provider || '—'}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Instância ID</div>
              <div className="text-sm font-mono text-[#9CA3AF] truncate">{userStatus?.instanceKey || '— aguardando'}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Mensagens Hoje</div>
              <div className="text-sm font-bold text-white">
                {userStatus?.messagesSentToday ?? 0}
                <span className="text-[#6B7280] text-xs font-normal ml-1">/ {userStatus?.limit ?? 100}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Qualidade</div>
              <div className="text-sm font-bold text-[#00E5A0]">Alta Disponibilidade</div>
            </div>
          </div>

          {!hasInstance && (
            <div className="mt-6 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl p-4 flex gap-3 items-start">
              <AlertCircle size={18} className="text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Sem instância atribuída</p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Ainda não há uma instância WhatsApp vinculada à sua conta. 
                  Entre em contato com o suporte ou aguarde a configuração automática.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Card Lateral */}
        <div className="space-y-4">
          {isConnected ? (
            <Card className="flex flex-col items-center text-center p-8 border-[#00E5A0]/20 bg-[#00E5A0]/5 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tudo pronto!</h3>
                <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                  Sua IA está ativa e respondendo automaticamente às mensagens.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center text-center p-8 border-[#6C5DD3]/20 bg-[#6C5DD3]/5 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3]">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Instância Gerenciada</h3>
                <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                  Sua conexão WhatsApp é gerenciada pela nossa equipe. Nenhuma configuração manual é necessária.
                </p>
              </div>
            </Card>
          )}

          <Card className="p-5 space-y-4">
            <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Recursos Incluídos</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                <Zap size={14} className="text-[#6C5DD3] shrink-0" /> Respostas automáticas com IA
              </li>
              <li className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                <MessageSquare size={14} className="text-[#6C5DD3] shrink-0" /> Histórico de conversas
              </li>
              <li className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                <ShieldCheck size={14} className="text-[#6C5DD3] shrink-0" /> Alta disponibilidade garantida
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
