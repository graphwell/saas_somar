'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2, AlertCircle, RefreshCcw, Loader2,
  ShieldCheck, MessageSquare, Zap, Wifi, WifiOff, QrCode, LogOut,
} from 'lucide-react';
import { WhatsAppWaiting } from '@/components/WhatsAppWaiting';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type Status =
  | 'idle'
  | 'loading'       // buscando do provedor (não faz poll automático)
  | 'qrCode'        // QR pronto — faz poll até conectar
  | 'connected'
  | 'no_instance'   // sem instância, mostra fila
  | 'invalid_credentials'
  | 'error';

type WaState = {
  status: Status;
  connected: boolean;
  qrCode?: string;
  error?: string;
  instanceKey?: string;
  provider?: string;
  plan?: string;
  messageCount?: number;
};

const POLL_INTERVAL_MS = 8000;   // poll só quando status === 'qrCode'
const MAX_LOADING_RETRIES = 5;   // após 5 tentativas em 'loading', mostra erro

export default function WhatsAppPage() {
  const [state, setState] = useState<WaState>({ status: 'idle', connected: false });
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const loadingRetries = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/user/whatsapp/qr');
      const data = await res.json();

      // 'loading' → conta tentativas para evitar loop infinito
      if (data.status === 'loading') {
        loadingRetries.current += 1;
        if (loadingRetries.current >= MAX_LOADING_RETRIES) {
          setState({
            status: 'error',
            connected: false,
            error: 'A instância está demorando para responder. Verifique as credenciais no painel admin ou tente novamente.',
          });
          return;
        }
      } else {
        loadingRetries.current = 0;
      }

      setState(prev => ({
        ...prev,
        status: data.status,
        connected: data.connected ?? false,
        qrCode: data.qrCode,
        error: data.error,
        instanceKey: data.instanceKey ?? prev.instanceKey,
        provider: data.provider ?? prev.provider,
        plan: data.plan ?? prev.plan,
        messageCount: data.messageCount ?? prev.messageCount,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        status: 'error',
        connected: false,
        error: 'Erro ao comunicar com o servidor.',
      }));
    }
  }, []);

  // Carrega na montagem
  useEffect(() => {
    setState({ status: 'loading', connected: false });
    fetchStatus();
    return stopPoll;
  }, [fetchStatus]);

  // Poll quando status === 'qrCode' (verificar se conectou)
  // Poll quando status === 'loading' (retentar até obter QR)
  useEffect(() => {
    stopPoll();
    if (state.status === 'qrCode') {
      pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    } else if (state.status === 'loading') {
      // Retry a cada 3s enquanto aguarda QR do provedor
      pollRef.current = setInterval(fetchStatus, 3000);
    }
    return stopPoll;
  }, [state.status, fetchStatus]);

  const handleRefresh = () => {
    loadingRetries.current = 0;
    stopPoll();
    setState(prev => ({ ...prev, status: 'loading' }));
    fetchStatus();
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja desconectar o WhatsApp atual? Um novo QR Code será gerado.')) return;
    setIsDisconnecting(true);
    try {
      await fetch('/api/user/whatsapp/disconnect', { method: 'POST' });
      loadingRetries.current = 0;
      setState({ status: 'loading', connected: false });
      setTimeout(fetchStatus, 2000);
    } catch {
      alert('Erro ao desconectar. Tente novamente.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // ── Estados simples ──────────────────────────────────

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-[#6C5DD3]" />
        <p className="text-[#6B7280]">Verificando conexão WhatsApp...</p>
      </div>
    );
  }

  if (state.status === 'no_instance') {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl">
        <PageHeader onRefresh={handleRefresh} />
        <WhatsAppWaiting />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl">
        <PageHeader onRefresh={handleRefresh} />
        <Card className="border-[#EF4444]/20 bg-[#EF4444]/5">
          <div className="flex items-start gap-4">
            <AlertCircle size={22} className="text-[#EF4444] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white">Erro de conexão</h3>
              <p className="text-sm text-[#9CA3AF] mt-1">{state.error}</p>
              <Button size="sm" variant="ghost" onClick={handleRefresh} className="mt-3 text-[#EF4444]">
                Tentar novamente
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (state.status === 'invalid_credentials') {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl">
        <PageHeader onRefresh={handleRefresh} />
        <Card className="border-[#EF4444]/20 bg-[#EF4444]/5">
          <div className="flex items-start gap-4">
            <WifiOff size={22} className="text-[#EF4444] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white text-lg">Instância não encontrada no provedor</h3>
              <p className="text-sm text-[#9CA3AF] mt-1">
                A instância <code className="text-white bg-white/10 px-1 rounded">{state.instanceKey}</code> não
                foi localizada no {state.provider}. Token ou ID incorreto.
              </p>
              {state.error && (
                <p className="text-xs text-[#EF4444] mt-2 font-mono bg-[#EF4444]/10 px-3 py-2 rounded-lg">
                  {state.error}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Estados principais: qrCode | connected ────────────

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <PageHeader onRefresh={handleRefresh} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className={`lg:col-span-2 border-l-4 ${
          state.connected ? 'border-l-[#00E5A0]' :
          state.status === 'qrCode' ? 'border-l-[#6C5DD3]' :
          'border-l-[#6B7280]'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              state.connected ? 'bg-[#00E5A0]/10 text-[#00E5A0]' :
              state.status === 'qrCode' ? 'bg-[#6C5DD3]/10 text-[#6C5DD3]' :
              'bg-white/5 text-[#6B7280]'
            }`}>
              {state.connected ? <Wifi size={28} /> : <QrCode size={28} />}
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">
                {state.connected ? 'WhatsApp Conectado' : 'Aguardando Escaneamento'}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={state.connected ? 'green' : 'default'}>
                  {state.connected ? '● ATIVO' : '● AGUARDANDO QR'}
                </Badge>
                <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
                  {state.provider} · {state.plan}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {state.status === 'qrCode' && state.qrCode && (
            <div className="mb-8 bg-[#6C5DD3]/5 border border-[#6C5DD3]/20 rounded-2xl p-6 flex flex-col items-center gap-5">
              <div className="bg-white p-3 rounded-xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.qrCode} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-bold text-sm">Escaneie com seu WhatsApp</p>
                <p className="text-[#9CA3AF] text-xs leading-relaxed">
                  WhatsApp → Menu (⋮) → Aparelhos conectados → Conectar aparelho
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-[#6C5DD3] text-xs font-medium">
                  <Loader2 size={12} className="animate-spin" />
                  Verificando a cada {POLL_INTERVAL_MS / 1000}s automaticamente
                </div>
              </div>
            </div>
          )}

          {/* Conectado */}
          {state.connected && (
            <div className="mb-8 space-y-4">
              <div className="bg-[#00E5A0]/5 border border-[#00E5A0]/20 rounded-2xl p-5 flex items-center gap-4">
                <CheckCircle2 size={24} className="text-[#00E5A0] shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">WhatsApp ativo e respondendo</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Sua IA está processando mensagens automaticamente.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost" size="sm"
                  onClick={handleDisconnect}
                  isLoading={isDisconnecting}
                  className="text-[#EF4444] hover:bg-[#EF4444]/10 text-xs"
                >
                  <LogOut size={13} className="mr-2" />
                  Trocar número / Desconectar
                </Button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Provedor', value: state.provider },
              { label: 'Instância ID', value: state.instanceKey, mono: true },
              {
                label: 'Mensagens',
                value: `${state.messageCount ?? 0} / ${state.plan === 'TRIAL' ? '100' : '∞'}`,
              },
              { label: 'Plano', value: state.plan, color: state.plan === 'PAID' ? '#00E5A0' : '#6C5DD3' },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">{item.label}</div>
                <div
                  className={`text-sm font-bold truncate ${item.mono ? 'font-mono text-[#9CA3AF]' : 'text-white'}`}
                  style={item.color ? { color: item.color } : {}}
                >
                  {item.value ?? '—'}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Lateral */}
        <div className="space-y-4">
          {state.connected ? (
            <Card className="flex flex-col items-center text-center p-8 border-[#00E5A0]/20 bg-[#00E5A0]/5 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tudo pronto!</h3>
                <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">Sua IA está ativa e respondendo automaticamente.</p>
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
              {[
                { icon: Zap, label: 'Respostas automáticas com IA' },
                { icon: MessageSquare, label: 'Histórico de conversas' },
                { icon: ShieldCheck, label: 'Alta disponibilidade' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <Icon size={14} className="text-[#6C5DD3] shrink-0" /> {label}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Conexão WhatsApp</h2>
        <p className="text-[#9CA3AF] mt-1">Conecte seu número para ativar a IA.</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onRefresh}>
        <RefreshCcw size={14} className="mr-2" /> Atualizar
      </Button>
    </div>
  );
}
