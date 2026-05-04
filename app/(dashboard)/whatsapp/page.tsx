"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone, CheckCircle2, QrCode,
  RefreshCcw, Loader2, AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function WhatsAppPage() {
  const [status, setStatus] = useState<any>(null);
  const [qrData, setQrData] = useState<{ qrcode: string | null; status: string } | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [currentInstance, setCurrentInstance] = useState<string | null>(null);

  // Busca status atual do usuário ao entrar na página
  useEffect(() => {
    fetch('/api/user/status')
      .then(r => r.json())
      .then(d => {
        setStatus(d);
        if (d.instanceKey) {
          setCurrentInstance(d.instanceKey);
          fetchQr(d.instanceKey);
        }
      });
  }, []);

  // Polling automático a cada 5s enquanto aguarda scan do QR
  useEffect(() => {
    if (!currentInstance || qrData?.status === 'open') return;
    const interval = setInterval(() => fetchQr(currentInstance), 5000);
    return () => clearInterval(interval);
  }, [currentInstance, qrData?.status]);

  const fetchQr = useCallback(async (instance: string) => {
    setIsLoadingQr(true);
    setError('');
    try {
      const r = await fetch(`/api/whatsapp/evolution/qrcode?instance=${instance}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Falha ao buscar QR Code');
      setQrData(d);
    } catch (e: any) {
      setError(e.message || 'Falha ao buscar QR Code');
    } finally {
      setIsLoadingQr(false);
    }
  }, []);

  // Cria a instância na Evolution API e gera o QR Code
  const handleCreateAndGenerateQr = async () => {
    setError('');
    setIsCreating(true);
    try {
      const r = await fetch('/api/whatsapp/evolution/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: 'minha-instancia' }) // nome base, será sanitizado pela API
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erro ao criar instância');
      setCurrentInstance(d.instanceName);
      setQrData({ qrcode: d.qrcode, status: d.status });
    } catch (e: any) {
      setError(e.message || 'Erro inesperado ao criar instância');
    } finally {
      setIsCreating(false);
    }
  };

  const isConnected = qrData?.status === 'open';

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Conexão WhatsApp</h2>
        <p className="text-[#9CA3AF] mt-1">Conecte seu WhatsApp para a IA começar a responder.</p>
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
                <h3 className="font-bold text-white">Status da Instância</h3>
                <div className="flex items-center gap-2 mt-1">
                  {isConnected
                    ? <Badge variant="green" className="animate-pulse">CONECTADO</Badge>
                    : <Badge variant="red">DESCONECTADO</Badge>}
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">
                    Plano: {status?.plan || '...'}
                  </span>
                </div>
              </div>
            </div>
            {currentInstance && (
              <Button variant="ghost" size="sm" onClick={() => fetchQr(currentInstance)} isLoading={isLoadingQr}>
                <RefreshCcw size={14} className="mr-2" /> Atualizar
              </Button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Provedor</div>
              <div className="text-sm font-bold text-white">Evolution API</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Instância</div>
              <div className="text-sm font-mono text-[#9CA3AF] truncate">{currentInstance || '— aguardando criação'}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Mensagens Usadas</div>
              <div className="text-sm font-bold text-white">{status?.messagesSentToday || 0} / {status?.limit || '∞'}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-widest">Segurança</div>
              <div className="text-sm font-bold text-[#00E5A0]">Criptografia E2E</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Instrução quando não conectado */}
          {!isConnected && (
            <div className="bg-[#00E5A0]/5 border border-[#00E5A0]/20 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-white">Como conectar:</p>
              <ol className="text-sm text-[#9CA3AF] space-y-1 list-decimal list-inside">
                <li>Clique em <span className="text-[#00E5A0] font-semibold">"Gerar Novo QR Code"</span></li>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Vá em <strong>Aparelhos Conectados</strong> → <strong>Conectar aparelho</strong></li>
                <li>Escaneie o QR Code que aparecerá na tela</li>
              </ol>
            </div>
          )}
        </Card>

        {/* QR Code Card */}
        <div>
          {isConnected ? (
            <Card className="flex flex-col items-center text-center p-8 border-[#00E5A0]/20 bg-[#00E5A0]/5 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">WhatsApp Conectado!</h3>
                <p className="text-xs text-[#9CA3AF] mt-2">Sua IA está ativa e respondendo automaticamente.</p>
              </div>
            </Card>
          ) : (
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
                {(isLoadingQr || isCreating) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Loader2 size={32} className="animate-spin text-[#00E5A0]" />
                    <p className="text-xs text-gray-400">{isCreating ? 'Criando instância...' : 'Carregando QR...'}</p>
                  </div>
                ) : qrData?.qrcode ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrData.qrcode.startsWith('data:') ? qrData.qrcode : `data:image/png;base64,${qrData.qrcode}`}
                    alt="QR Code WhatsApp"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <QrCode size={48} className="text-gray-400" />
                    <p className="text-xs text-gray-500">Clique em Gerar QR Code</p>
                  </div>
                )}
                <div className="absolute -inset-2 border-2 border-dashed border-[#00E5A0]/40 rounded-[20px] animate-pulse-slow pointer-events-none" />
              </div>

              <Button
                className="w-full font-bold"
                onClick={currentInstance ? () => fetchQr(currentInstance) : handleCreateAndGenerateQr}
                isLoading={isLoadingQr || isCreating}
              >
                <RefreshCcw size={14} className="mr-2" /> Gerar Novo QR Code
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
