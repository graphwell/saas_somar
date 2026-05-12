'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type AuditLog = {
  id: string;
  createdAt: string;
  editedBy: string;
  action: string;
  agent: {
    name: string;
    user: { name: string; email: string };
  };
};

const actionLabel: Record<string, string> = {
  UPDATE_PROMPT: 'Prompt Atualizado',
  UPDATE_TEMPERATURE: 'Temperatura Alterada',
  UPDATE_NAME: 'Nome Alterado',
  CREATE: 'Agente Criado',
};

export default function LogsAdminPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const todayLogs = logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-white tracking-tight">Logs de Auditoria</h2>
            <Badge variant="gray">{logs.length} registros</Badge>
          </div>
          <p className="text-[#9CA3AF]">Histórico real de alterações nos agentes da plataforma.</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="font-bold gap-2"
        >
          {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Atualizar
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#6C5DD3]/20 bg-[#6C5DD3]/5 space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Total de Logs</h4>
          <div className="text-2xl font-black text-[#6C5DD3]">{logs.length}</div>
          <p className="text-[10px] text-[#9CA3AF]">Registros acumulados no sistema.</p>
        </Card>
        <Card className="border-[#00E5A0]/20 bg-[#00E5A0]/5 space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Hoje</h4>
          <div className="text-2xl font-black text-[#00E5A0]">{todayLogs.length}</div>
          <p className="text-[10px] text-[#9CA3AF]">Alterações realizadas hoje.</p>
        </Card>
        <Card className="border-[#EF4444]/20 bg-[#EF4444]/5 space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Agentes Afetados</h4>
          <div className="text-2xl font-black text-[#EF4444]">
            {new Set(logs.map(l => l.agent?.name)).size}
          </div>
          <p className="text-[10px] text-[#9CA3AF]">Agentes que tiveram configuração alterada.</p>
        </Card>
      </div>

      {/* Console de logs */}
      <Card className="p-0 border-white/5 bg-black/40 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
          <Terminal size={18} className="text-[#6B7280]" />
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#6B7280] uppercase tracking-widest">
            <span>Console de Auditoria — Somar.IA</span>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-white/5 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-[#6B7280]">
              <Loader2 size={28} className="animate-spin text-[#6C5DD3]" />
              <span>Carregando logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-[#6B7280]">
              <FileText size={36} />
              <div className="text-center">
                <p className="font-bold text-white">Nenhum log encontrado</p>
                <p className="text-xs mt-1">Os logs aparecerão aqui quando usuários editarem seus agentes.</p>
              </div>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-6 group">
                <span className="text-[#6B7280] shrink-0 w-20 text-[10px]">
                  {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-[#9CA3AF] shrink-0 max-w-[140px] truncate">
                  {log.agent?.user?.name ?? '—'}
                </span>
                <div className="flex items-center gap-2 shrink-0 w-44">
                  <CheckCircle2 size={12} className="text-[#00E5A0]" />
                  <span className="text-white">{actionLabel[log.action] ?? log.action}</span>
                </div>
                <ArrowRight size={10} className="text-white/10 group-hover:text-white/40 transition-colors" />
                <span className="text-[#9CA3AF] truncate">
                  Agente: <strong className="text-white">{log.agent?.name ?? '—'}</strong>
                  {' · '}Por: {log.editedBy}
                </span>
                <span className="ml-auto text-[#6B7280] shrink-0 text-[10px]">
                  {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] font-bold text-[#6B7280]">
          <span>{logs.length} eventos registrados</span>
          <span>Dados reais do banco de dados</span>
        </div>
      </Card>
    </div>
  );
}
