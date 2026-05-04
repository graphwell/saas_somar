'use client';

import { useEffect, useState, useCallback } from 'react';

export function useInstanceStatus(instanceName: string | null) {
  const [status, setStatus] = useState<string>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const poll = useCallback(async () => {
    if (!instanceName) return;
    
    try {
      // 1. Tenta buscar do banco (atualizado pelo webhook)
      const dbRes = await fetch(`/api/instance/status/${instanceName}`);
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        if (dbData.status === 'connected') {
          setStatus('connected');
          return;
        }
      }

      // 2. Fallback: consulta diretamente a Evolution API (via nossa API interna)
      const evoRes = await fetch(`/api/instance/qrcode/${instanceName}`);
      if (evoRes.ok) {
        const evoData = await evoRes.json();

        if (evoData.qrCode) {
          setQrCode(evoData.qrCode);
          setStatus('awaiting_qr');
        } else if (evoData.status === 'open') {
          setStatus('connected');
        } else {
          setStatus(evoData.status || 'disconnected');
        }
      }
    } catch (err) {
      console.error('[useInstanceStatus] Erro no polling:', err);
    }
  }, [instanceName]);

  // Polling automático a cada 5 segundos
  useEffect(() => {
    if (!instanceName) return;
    
    poll();
    const interval = setInterval(poll, 5000);
    
    // Para o polling se já conectou para poupar requisições
    if (status === 'connected') {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [instanceName, poll, status]);

  // Atualização manual
  const refresh = async () => {
    setIsRefreshing(true);
    await poll();
    setIsRefreshing(false);
  };

  return { status, qrCode, refresh, isRefreshing };
}
