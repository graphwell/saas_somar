"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone, CheckCircle2, QrCode,
  RefreshCcw, Plus, Loader2, AlertCircle, X
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function WhatsAppPage() {
  const [status, setStatus] = useState<any>(null);
  const [qrData, setQrData] = useState<{ qrcode: string | null; status: string } | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [syncInstanceKey, setSyncInstanceKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [error, setError] = useState('');
  const [currentInstance, setCurrentInstance] = useState<string | null>(null);

  // Busca status atual do usuário
  useEffect(() => {
    fetch('/api/user/status')
      .then(r => r.json())
      .then(d => {
        setStatus(d);
        // Se já tem instância salva, busca o QR/status dela
        if (d.instanceKey) {
          setCurrentInstance(d.instanceKey);
          fetchQr(d.instanceKey);
        }
      });
  }, []);

  // Polling automático a cada 5s se aguardando QR scan
  useEffect(() => {
    if (!currentInstance || qrData?.status === 'open') return;
    const interval = setInterval(() => fetchQr(currentInstance), 5000);
    return () => clearInterval(interval);
  }, [currentInstance, qrData?.status]);

  const fetchQr = useCallback(async (instance: string) => {
    setIsLoadingQr(true);
    try {
      const r = await fetch(`/api/whatsapp/evolution/qrcode?instance=${instance}`);
      const d = await r.json();
      setQrData(d);
    } catch {
      setError('Falha ao buscar QR Code');
    } finally {
      setIsLoadingQr(false);
    }
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSyncing(true);
    try {
      const r = await fetch('/api/whatsapp/evolution/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceKey: syncInstanceKey.trim() })
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Erro ao sincronizar'); return; }
      setCurrentInstance(syncInstanceKey.trim());
      setShowSyncModal(false);
      setSyncInstanceKey('');
      fetchQr(syncInstanceKey.trim());
    } catch {
      setError('Erro inesperado ao sincronizar instância');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);
    try {
      const r = await fetch('/api/whatsapp/evolution/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName })
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Erro ao criar'); return; }
      setCurrentInstance(d.instanceName);
      setQrData({ qrcode: d.qrcode, status: d.status });
      setShowNewModal(false);
      setInstanceName('');
    } catch {
      setError('Erro inesperado ao criar instância');
    } finally {
      setIsCreating(false);
    }
  };

  const isConnected = qrData?.status === 'open';

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Conexão WhatsApp</h2>
          <p className="text-[#9CA3AF] mt-1">Conecte seu WhatsApp para a IA começar a responder.</p>
        </div>
        {!currentInstance && (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowSyncModal(true)} className="gap-2">
              <RefreshCcw size={16} /> Vincular Existente
            </Button>
            <Button onClick={() => setShowNewModal(true)} className="gap-2 font-bold">
              <Plus size={16} /> Nova Instância
            </Button>
          </div>
        )}
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
              <div className="text-sm font-mono text-[#9CA3AF] truncate">{currentInstance || '—'}</div>
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
        </Card>

        {/* QR Code Card */}
        <div>
          {isConnected ? (
            <Card className="flex flex-col items-center text-center p-8 border-[#00E5A0]/20 bg-[#00E5A0]/5 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">WhatsApp Conectado</h3>
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
                {isLoadingQr ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-[#00E5A0]" />
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
                    <p className="text-xs text-gray-500">
                      {currentInstance ? 'Clique em Gerar QR Code' : 'Crie uma instância primeiro'}
                    </p>
                  </div>
                )}
                <div className="absolute -inset-2 border-2 border-dashed border-[#00E5A0]/40 rounded-[20px] animate-pulse-slow pointer-events-none" />
              </div>

              {currentInstance ? (
                <Button
                  className="w-full font-bold"
                  onClick={() => fetchQr(currentInstance)}
                  isLoading={isLoadingQr}
                >
                  <RefreshCcw size={14} className="mr-2" /> Gerar Novo QR Code
                </Button>
              ) : (
                <Button className="w-full font-bold" onClick={() => setShowNewModal(true)}>
                  <Plus size={14} className="mr-2" /> Criar Instância
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Modal Nova Instância */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <Card className="relative w-full max-w-md p-0 border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00E5A0]/10 flex items-center justify-center text-[#00E5A0]">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Nova Instância WhatsApp</h3>
                  <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Evolution API</p>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-2 rounded-full hover:bg-white/5 text-[#6B7280]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <Input
                label="Nome da Instância"
                placeholder="Ex: minha-loja, clinica-central"
                value={instanceName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceName(e.target.value)}
                required
              />
              <p className="text-[11px] text-[#6B7280] leading-relaxed -mt-3">
                Use apenas letras minúsculas, números e hífens. Um ID único será gerado automaticamente.
              </p>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowNewModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 font-bold" isLoading={isCreating}>
                  Criar e Gerar QR
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Vincular Instância Existente */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm" onClick={() => setShowSyncModal(false)} />
          <Card className="relative w-full max-w-md p-0 border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3]">
                  <RefreshCcw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Vincular Instância Existente</h3>
                  <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Evolution API</p>
                </div>
              </div>
              <button onClick={() => setShowSyncModal(false)} className="p-2 rounded-full hover:bg-white/5 text-[#6B7280]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSync} className="p-8 space-y-6">
              <Input
                label="Nome da Instância (instanceKey)"
                placeholder="Ex: francisco-94386546"
                value={syncInstanceKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSyncInstanceKey(e.target.value)}
                required
              />
              <p className="text-[11px] text-[#6B7280] leading-relaxed -mt-3">
                Digite exatamente o nome da instância que já existe na Evolution API.
              </p>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowSyncModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 font-bold" isLoading={isSyncing}>
                  Vincular e Gerar QR
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
