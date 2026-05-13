'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone, CheckCircle2, AlertCircle,
  RefreshCcw, Loader2, ShieldCheck, MessageSquare,
  Zap, Wifi, WifiOff, QrCode,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type WaStatus = {
  hasInstance: boolean;
  connected: boolean;
  status: 'connected' | 'qrCode' | 'loading' | 'disconnected' | 'error' | 'no_instance';
  qrCode?: string;
  instanceKey?: string;
  provider?: string;
  plan?: string;
  messageCount?: number;
};

export default function WhatsAppPage() {
  const [data, setData] = useState<WaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await fetch('/api/user/whatsapp/status');
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Polling a cada 5s quando aguardando scan do QR
  useEffect(() => {
    if (data?.status !== 'qrCode' && data?.status !== 'loading') return;
    const id = setInterval(() => fetchStatus(true), 5000);
    return () => clearInterval(id);
  }, [data?.status, fetchStatus]);

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
          <p className="text-[#9CA3AF] mt-1">Conecte seu número para ativar a IA.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchStatus()} isLoading={isRefreshing}>
          <RefreshCcw size={14} className="mr-2" /> Atualizar
        </Button>
      </div>

      {/* Sem instância atribuída */}
      {(!data?.hasInstance || data.status === 'no_instance') && (
        <Card className="border-[#EF4444]/20 bg-[#EF4444]/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center shrink-0">
              <WifiOff size={22} className="text-[#EF4444]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Sem instância disponível</h3>
              <p className="text-sm text-[#9CA3AF] mt-1 leading-relaxed">
                No momento não há instâncias WhatsApp disponíveis no sistema.
                Nossa equipe foi notificada e irá adicionar novas instâncias em breve.
                Você receberá acesso assim que uma estiver disponível.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#F59E0B] font-medium">
                <AlertCircle size={13} />
                Aguardando liberação pela equipe Somar.IA
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tem instância */}
      {data?.hasInstance && data.status !== 'no_instance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Painel principal */}
          <Card className={`lg:col-span-2 border-l-4 ${
            data.connected ? 'border-l-[#00E5A0]' :
            data.status === 'qrCode' ? 'border-l-[#6C5DD3]' :
            'border-l-[#6B7280]'
          }`}>
            {/* Header do card */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                data.connected ? 'bg-[#00E5A0]/10 text-[#00E5A0]' :
                data.status === 'qrCode' ? 'bg-[#6C5DD3]/10 text-[#6C5DD3]' :
                'bg-white/5 text-[#6B7280]'
              }`}>
                {data.connected ? <Wifi size={28} /> :
                 data.status === 'qrCode' ? <QrCode size={28} /> :
                 <Smartphone size={28} />}
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">
                  {data.connected ? 'WhatsApp Conectado' :
                   data.status === 'qrCode' ? 'Aguardando Escaneamento' :
                   data.status === 'loading' ? 'Preparando instância...' :
                   'Desconectado'}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={
                    data.connected ? 'green' :
                    data.status === 'qrCode' ? 'default' : 'gray'
                  }>
                    {data.connected ? '● ATIVO' :
                     data.status === 'qrCode' ? '● AGUARDANDO QR' :
                     data.status === 'loading' ? '● CARREGANDO' :
                     '● INATIVO'}
                  </Badge>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
                    {data.provider} · {data.plan}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {data.status === 'qrCode' && data.qrCode && (
              <div className="mb-8">
                <div className="bg-[#6C5DD3]/5 border border-[#6C5DD3]/20 rounded-2xl p-6 flex flex-col items-center gap-5">
                  <div className="bg-white p-3 rounded-xl shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.qrCode}
                      alt="QR Code WhatsApp"
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-white font-bold text-sm">Escaneie com seu WhatsApp</p>
                    <p className="text-[#9CA3AF] text-xs leading-relaxed">
                      Abra o WhatsApp → Menu → Aparelhos conectados → Conectar aparelho
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-[#6C5DD3] text-xs font-medium">
                      <Loader2 size={12} className="animate-spin" />
                      Aguardando escaneamento (atualiza automaticamente)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {data.status === 'loading' && (
              <div className="mb-8 flex flex-col items-center gap-3 py-8">
                <Loader2 size={32} className="animate-spin text-[#6C5DD3]" />
                <p className="text-[#9CA3AF] text-sm">Gerando QR Code... aguarde alguns segundos.</p>
              </div>
            )}

            {/* Conectado */}
            {data.connected && (
              <div className="mb-8 bg-[#00E5A0]/5 border border-[#00E5A0]/20 rounded-2xl p-5 flex items-center gap-4">
                <CheckCircle2 size={24} className="text-[#00E5A0] shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">WhatsApp ativo e respondendo</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Sua IA está processando mensagens automaticamente nesta linha.
                  </p>
                </div>
              </div>
            )}

            {/* Detalhes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Provedor</div>
                <div className="text-sm font-bold text-white">{data.provider || '—'}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Instância ID</div>
                <div className="text-sm font-mono text-[#9CA3AF] truncate">{data.instanceKey || '—'}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Mensagens</div>
                <div className="text-sm font-bold text-white">
                  {data.messageCount ?? 0}
                  <span className="text-[#6B7280] text-xs font-normal ml-1">
                    / {data.plan === 'TRIAL' ? '100' : '∞'}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Plano</div>
                <div className={`text-sm font-bold ${data.plan === 'PAID' ? 'text-[#00E5A0]' : 'text-[#6C5DD3]'}`}>
                  {data.plan || '—'}
                </div>
              </div>
            </div>
          </Card>

          {/* Coluna lateral */}
          <div className="space-y-4">
            {data.connected ? (
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
                  <QrCode size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Como conectar</h3>
                  <ol className="text-xs text-[#9CA3AF] mt-3 space-y-2 text-left list-decimal list-inside leading-relaxed">
                    <li>Abra o WhatsApp no celular</li>
                    <li>Toque em <strong className="text-white">Menu</strong> (⋮)</li>
                    <li>Toque em <strong className="text-white">Aparelhos conectados</strong></li>
                    <li>Toque em <strong className="text-white">Conectar aparelho</strong></li>
                    <li>Aponte a câmera para o QR Code</li>
                  </ol>
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
                  <ShieldCheck size={14} className="text-[#6C5DD3] shrink-0" /> Alta disponibilidade
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
