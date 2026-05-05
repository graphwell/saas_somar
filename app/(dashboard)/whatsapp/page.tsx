"use client";

import React, { useState, useEffect } from 'react';
import {
  Smartphone, CheckCircle2, QrCode,
  RefreshCcw, Loader2, AlertCircle, ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useInstanceStatus } from '@/hooks/useInstanceStatus';

export default function WhatsAppPage() {
  const [userStatus, setUserStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentInstance, setCurrentInstance] = useState<string | null>(null);

  // O hook useInstanceStatus só faz polling se o provider for EVOLUTION
  const isEvolution = userStatus?.provider === 'EVOLUTION';
  const { status: instanceStatus, qrCode, refresh, isRefreshing } = useInstanceStatus(isEvolution ? currentInstance : null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const r = await fetch('/api/user/status');
      const d = await r.json();
      setUserStatus(d);
      if (d.instanceKey) {
        setCurrentInstance(d.instanceKey);
      }
    } catch (err) {
      setError('Erro ao carregar status do WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isConnected = isEvolution ? (instanceStatus === 'connected') : (userStatus?.status === 'IN_USE');

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-[#6C5DD3]" />
        <p className="text-[#6B7280]">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Conexão WhatsApp</h2>
        <p className="text-[#9CA3AF] mt-1">Status da sua integração com o agente de IA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Card */}
        <Card className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConnected ? 'bg-[#00E5A0]/10 text-[#00E5A0]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white">Status da Conexão</h3>
                <div className="flex items-center gap-2 mt-1">
                  {isConnected
                    ? <Badge variant="green" className="animate-pulse">CONECTADO</Badge>
                    : <Badge variant="red">DESCONECTADO</Badge>}
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
                    Plano: {userStatus?.plan?.toUpperCase() || '...'}
                  </span>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={fetchStatus} isLoading={isLoading}>
              <RefreshCcw size={14} className="mr-2" /> Atualizar Status
            </Button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Provedor Ativo</div>
              <div className="text-sm font-bold text-white">{userStatus?.provider || '—'}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">ID da Instância</div>
              <div className="text-sm font-mono text-[#9CA3AF] truncate">{currentInstance || '— aguardando atribuição'}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Mensagens Usadas (Hoje)</div>
              <div className="text-sm font-bold text-white">{userStatus?.messagesSentToday || 0} / {userStatus?.limit || '∞'}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Qualidade</div>
              <div className="text-sm font-bold text-[#00E5A0]">Alta Disponibilidade</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {!isConnected && !isEvolution && (
            <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl p-4 flex gap-3 items-start">
              <AlertCircle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Conexão Pendente</p>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Sua instância {userStatus?.provider} está sendo configurada. Se o problema persistir por mais de 5 minutos, entre em contato com nosso suporte técnico.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Action/QR Column */}
        <div>
          {isEvolution ? (
            <Card className="flex flex-col items-center text-center p-8 border-[#00E5A0]/20 bg-[#00E5A0]/5 gap-6">
               <div className="w-12 h-12 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                <QrCode size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Escanear QR Code</h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">Abra o WhatsApp → Aparelhos Conectados → Conectar aparelho</p>
              </div>

              {/* QR Code Display */}
              <div className="w-52 h-52 bg-white p-3 rounded-2xl relative overflow-hidden">
                {(isRefreshing || instanceStatus === 'loading') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-2">
                    <Loader2 size={32} className="animate-spin text-[#00E5A0]" />
                    <p className="text-xs text-gray-400">Carregando...</p>
                  </div>
                ) : qrCode ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                    alt="QR Code WhatsApp"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center p-2">
                    <CheckCircle2 size={48} className="text-[#00E5A0]" />
                    <p className="text-xs text-[#00E5A0] font-bold">Conectado</p>
                  </div>
                )}
                <div className="absolute -inset-2 border-2 border-dashed border-[#00E5A0]/40 rounded-[20px] animate-pulse-slow pointer-events-none" />
              </div>

              <Button
                className="w-full font-bold"
                onClick={refresh}
                isLoading={isRefreshing}
              >
                <RefreshCcw size={14} className="mr-2" /> Recarregar QR Code
              </Button>
            </Card>
          ) : (
            <Card className="flex flex-col items-center text-center p-8 border-[#6C5DD3]/20 bg-[#6C5DD3]/5 gap-6">
              <div className="w-16 h-16 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3]">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Instalação Gerenciada</h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Sua instância no plano <b>{userStatus?.plan?.toUpperCase()}</b> é gerenciada automaticamente. Não é necessário escanear QR Code aqui.
                </p>
              </div>
              
              <div className="w-full pt-4 border-t border-white/5">
                <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest mb-4">Recursos Ativos</p>
                <ul className="text-left space-y-3">
                  <li className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <CheckCircle2 size={14} className="text-[#00E5A0]" /> Respostas Automáticas IA
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <CheckCircle2 size={14} className="text-[#00E5A0]" /> Suporte Multilingue
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <CheckCircle2 size={14} className="text-[#00E5A0]" /> Logs de Auditoria
                  </li>
                </ul>
              </div>

              <Button variant="ghost" className="w-full font-bold text-[#6C5DD3]">
                Alterar Plano
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

