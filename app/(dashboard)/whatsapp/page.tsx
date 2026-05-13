'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone, CheckCircle2, AlertCircle,
  RefreshCcw, Loader2, ShieldCheck, MessageSquare,
  Zap, Wifi, WifiOff, QrCode, XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type InstanceInfo = {
  hasInstance: boolean;
  instanceKey?: string;
  provider?: string;
  plan?: string;
  messageCount?: number;
};

type QrState = {
  status: 'idle' | 'loading' | 'pending' | 'qrCode' | 'connected' | 'invalid_credentials' | 'error' | 'no_instance';
  connected: boolean;
  qrCode?: string;
  error?: string;
};

export default function WhatsAppPage() {
  const [info, setInfo] = useState<InstanceInfo | null>(null);
  const [qr, setQr] = useState<QrState>({ status: 'idle', connected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/whatsapp/status');
      const data = await res.json();
      setInfo(data);
      if (!data.hasInstance) {
        setQr({ status: 'no_instance', connected: false });
      }
    } catch {
      setInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQr = useCallback(async (silent = false) => {
    if (!silent) setQr(prev => ({ ...prev, status: 'loading' }));
    else setIsRefreshing(true);
    try {
      const res = await fetch('/api/user/whatsapp/qr');
      const data = await res.json();
      setQr({
        status: data.status,
        connected: data.connected ?? false,
        qrCode: data.qrCode,
        error: data.error,
      });
    } catch {
      setQr({ status: 'error', connected: false, error: 'Falha ao conectar com o provedor.' });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  useEffect(() => {
    if (info?.hasInstance) fetchQr();
  }, [info?.hasInstance, fetchQr]);

  // Polling a cada 5s enquanto aguarda scan
  useEffect(() => {
    if (qr.status !== 'qrCode' && qr.status !== 'loading') return;
    const id = setInterval(() => fetchQr(true), 5000);
    return () => clearInterval(id);
  }, [qr.status, fetchQr]);

  const handleRefresh = () => {
    fetchQr();
  };

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
        {info?.hasInstance && (
          <Button variant="ghost" size="sm" onClick={handleRefresh} isLoading={isRefreshing}>
            <RefreshCcw size={14} className="mr-2" /> Atualizar
          </Button>
        )}
      </div>

      {/* ── Sem instância ── */}
      {qr.status === 'no_instance' && (
        <Card className="border-[#F59E0B]/20 bg-[#F59E0B]/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
              <WifiOff size={22} className="text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Sem instância disponível</h3>
              <p className="text-sm text-[#9CA3AF] mt-1 leading-relaxed">
                No momento não há instâncias WhatsApp disponíveis. Nossa equipe foi notificada
                e irá configurar uma linha para você em breve.
              </p>
              <p className="text-xs text-[#F59E0B] mt-3 font-medium">
                ⏳ Aguardando liberação pela equipe Somar.IA
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Credenciais inválidas ── */}
      {qr.status === 'invalid_credentials' && (
        <Card className="border-[#EF4444]/20 bg-[#EF4444]/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center shrink-0">
              <XCircle size={22} className="text-[#EF4444]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Instância não encontrada no provedor</h3>
              <p className="text-sm text-[#9CA3AF] mt-1 leading-relaxed">
                A instância <code className="text-white bg-white/10 px-1 rounded">{info?.instanceKey}</code> não
                foi localizada no {info?.provider}. O token ou o ID da instância pode estar incorreto.
              </p>
              {qr.error && (
                <p className="text-xs text-[#EF4444] mt-2 font-mono bg-[#EF4444]/10 px-3 py-2 rounded-lg">
                  {qr.error}
                </p>
              )}
              <p className="text-xs text-[#9CA3AF] mt-3">
                Contate o suporte para corrigir as credenciais da instância.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Erro genérico ── */}
      {qr.status === 'error' && (
        <Card className="border-[#EF4444]/20 bg-[#EF4444]/5">
          <div className="flex items-start gap-4">
            <AlertCircle size={22} className="text-[#EF4444] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white">Erro ao conectar com o provedor</h3>
              <p className="text-sm text-[#9CA3AF] mt-1">{qr.error || 'Falha na comunicação com o servidor WhatsApp.'}</p>
              <Button size="sm" variant="ghost" onClick={handleRefresh} className="mt-3 text-[#EF4444]">
                Tentar novamente
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Tem instância ── */}
      {info?.hasInstance && !['no_instance', 'invalid_credentials', 'error'].includes(qr.status) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className={`lg:col-span-2 border-l-4 ${
            qr.connected ? 'border-l-[#00E5A0]' :
            qr.status === 'qrCode' ? 'border-l-[#6C5DD3]' :
            'border-l-[#6B7280]'
          }`}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                qr.connected ? 'bg-[#00E5A0]/10 text-[#00E5A0]' :
                qr.status === 'qrCode' ? 'bg-[#6C5DD3]/10 text-[#6C5DD3]' :
                'bg-white/5 text-[#6B7280]'
              }`}>
                {qr.connected ? <Wifi size={28} /> :
                 qr.status === 'qrCode' ? <QrCode size={28} /> :
                 <Smartphone size={28} />}
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">
                  {qr.connected ? 'WhatsApp Conectado' :
                   qr.status === 'qrCode' ? 'Aguardando Escaneamento' :
                   'Preparando conexão...'}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={qr.connected ? 'green' : qr.status === 'qrCode' ? 'default' : 'gray'}>
                    {qr.connected ? '● ATIVO' :
                     qr.status === 'qrCode' ? '● AGUARDANDO QR' :
                     '● CARREGANDO'}
                  </Badge>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
                    {info.provider} · {info.plan}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qr.status === 'qrCode' && qr.qrCode && (
              <div className="mb-8 bg-[#6C5DD3]/5 border border-[#6C5DD3]/20 rounded-2xl p-6 flex flex-col items-center gap-5">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr.qrCode} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-white font-bold text-sm">Escaneie com seu WhatsApp</p>
                  <p className="text-[#9CA3AF] text-xs leading-relaxed">
                    WhatsApp → Menu (⋮) → Aparelhos conectados → Conectar aparelho
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-[#6C5DD3] text-xs font-medium">
                    <Loader2 size={12} className="animate-spin" />
                    Atualizando automaticamente a cada 5 segundos
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {(qr.status === 'loading' || qr.status === 'pending') && (
              <div className="mb-8 flex flex-col items-center gap-3 py-8">
                <Loader2 size={32} className="animate-spin text-[#6C5DD3]" />
                <p className="text-[#9CA3AF] text-sm">Buscando QR Code no provedor...</p>
              </div>
            )}

            {/* Conectado */}
            {qr.connected && (
              <div className="mb-8 bg-[#00E5A0]/5 border border-[#00E5A0]/20 rounded-2xl p-5 flex items-center gap-4">
                <CheckCircle2 size={24} className="text-[#00E5A0] shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">WhatsApp ativo e respondendo</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Sua IA está processando mensagens automaticamente.</p>
                </div>
              </div>
            )}

            {/* Detalhes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Provedor</div>
                <div className="text-sm font-bold text-white">{info.provider}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Instância ID</div>
                <div className="text-sm font-mono text-[#9CA3AF] truncate">{info.instanceKey}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Mensagens</div>
                <div className="text-sm font-bold text-white">
                  {info.messageCount ?? 0}
                  <span className="text-[#6B7280] text-xs font-normal ml-1">/ {info.plan === 'TRIAL' ? '100' : '∞'}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Plano</div>
                <div className={`text-sm font-bold ${info.plan === 'PAID' ? 'text-[#00E5A0]' : 'text-[#6C5DD3]'}`}>
                  {info.plan}
                </div>
              </div>
            </div>
          </Card>

          {/* Lateral */}
          <div className="space-y-4">
            {qr.connected ? (
              <Card className="flex flex-col items-center text-center p-8 border-[#00E5A0]/20 bg-[#00E5A0]/5 gap-4">
                <div className="w-16 h-16 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tudo pronto!</h3>
                  <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                    Sua IA está ativa e respondendo automaticamente.
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
                    <li>Toque em Menu <strong className="text-white">(⋮)</strong></li>
                    <li>Toque em <strong className="text-white">Aparelhos conectados</strong></li>
                    <li>Toque em <strong className="text-white">Conectar aparelho</strong></li>
                    <li>Aponte para o QR Code ao lado</li>
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
