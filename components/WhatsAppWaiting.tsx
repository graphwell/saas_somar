'use client';

import { useEffect, useState } from 'react';
import { Clock, RefreshCcw } from 'lucide-react';

export function WhatsAppWaiting() {
  const [position, setPosition] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/whatsapp/queue-position');
      const data = await res.json();
      if (!data.inQueue) {
        // Saiu da fila — instância foi atribuída
        window.location.reload();
        return;
      }
      setPosition(data.position);
    } catch {
      // silencioso
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
        <Clock size={32} className="text-[#F59E0B]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Configurando seu WhatsApp</h2>
        <p className="text-[#9CA3AF] max-w-sm mx-auto leading-relaxed">
          Estamos preparando uma instância para você. Você será conectado automaticamente
          assim que uma estiver disponível.
        </p>
        {position !== null && (
          <p className="text-sm text-[#6B7280] mt-3">
            Posição na fila: <strong className="text-white">{position}</strong>
          </p>
        )}
      </div>
      <button
        onClick={check}
        disabled={checking}
        className="flex items-center gap-2 text-xs text-[#6B7280] hover:text-white transition-colors"
      >
        <RefreshCcw size={13} className={checking ? 'animate-spin' : ''} />
        Verificar agora
      </button>
    </div>
  );
}
