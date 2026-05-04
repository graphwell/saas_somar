"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
        <AlertTriangle size={36} />
      </div>

      <div className="space-y-3 max-w-md">
        <h2 className="text-2xl font-bold text-white">Algo deu errado</h2>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          Ocorreu um erro inesperado. Tente novamente ou volte para o dashboard.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="mt-4 text-left text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-xl p-4 overflow-auto max-h-32 font-mono">
            {error.message}
          </pre>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 bg-[#00E5A0]/10 hover:bg-[#00E5A0]/20 border border-[#00E5A0]/20 text-[#00E5A0] rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
        >
          <Home size={16} />
          Ir ao Dashboard
        </Link>
      </div>
    </div>
  );
}
