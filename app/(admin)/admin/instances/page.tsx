'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Server,
  Plus,
  Trash2,
  Link2Off,
  Smartphone,
  ShieldCheck,
  Loader2,
  Power,
  Copy,
  Check,
  UserPlus,
  Search,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Instance = {
  id: string;
  name: string;
  provider: string;
  instanceKey: string;
  plan: string;
  status: string;
  messageCount: number;
  createdAt: string;
  user: { name: string; email: string } | null;
};

type UserOption = {
  id: string;
  name: string;
  email: string;
  subscription: { planType: string; status: string } | null;
  instances: { id: string }[];
};

type Toast = { id: number; message: string; type: 'success' | 'error' };

// ──────────────────────────────────────────────
// Utilitários
// ──────────────────────────────────────────────
function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ──────────────────────────────────────────────
// Sub-componente: Toast simples
// ──────────────────────────────────────────────
function ToastList({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-xl animate-slide-up ${
            t.type === 'success'
              ? 'bg-[#00E5A0]/10 border border-[#00E5A0]/30 text-[#00E5A0]'
              : 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]'
          }`}
        >
          {t.type === 'success' ? <Check size={15} /> : <AlertTriangle size={15} />}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-componente: Modal de atribuição manual
// ──────────────────────────────────────────────
function AssignModal({
  instance,
  users,
  onClose,
  onAssign,
}: {
  instance: Instance;
  users: UserOption[];
  onClose: () => void;
  onAssign: (instanceId: string, userId: string) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onAssign(instance.id, selected);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h3 className="text-white font-bold text-lg leading-none">Atribuir Instância</h3>
            <p className="text-[#6B7280] text-xs mt-1">{instance.name} — {instance.provider}</p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-5 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#6C5DD3] transition-colors"
              placeholder="Buscar usuário por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="px-6 pb-3 max-h-[280px] overflow-y-auto space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-center text-[#6B7280] text-sm py-8">Nenhum usuário encontrado.</p>
          ) : (
            filtered.map((u) => {
              const hasInstance = u.instances.length > 0;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(u.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    selected === u.id
                      ? 'bg-[#6C5DD3]/20 border border-[#6C5DD3]/40'
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#6C5DD3]/20 flex items-center justify-center text-[#6C5DD3] font-bold text-sm shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{u.name}</p>
                    <p className="text-[#6B7280] text-xs truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.subscription?.planType === 'pro' ? 'bg-[#00E5A0]/10 text-[#00E5A0]' : 'bg-[#6C5DD3]/10 text-[#6C5DD3]'
                    }`}>
                      {u.subscription?.planType?.toUpperCase() ?? 'FREE'}
                    </span>
                    {hasInstance && (
                      <span className="text-[10px] text-[#F59E0B]">tem instância</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/5 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button
            size="sm"
            disabled={!selected}
            isLoading={submitting}
            onClick={handleConfirm}
            className="bg-[#6C5DD3] hover:bg-[#5a4caf] disabled:opacity-40"
          >
            <UserPlus size={14} className="mr-2" /> Confirmar Atribuição
          </Button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
export default function AdminInstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Instance | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterProvider, setFilterProvider] = useState('ALL');

  const [formData, setFormData] = useState({
    name: '',
    provider: 'ULTRAMSG',
    instanceKey: '',
    apiToken: '',
    plan: 'TRIAL',
  });

  // ──────────────────────────────────────────
  // Data fetching
  // ──────────────────────────────────────────
  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [instRes, usersRes] = await Promise.all([
        fetch('/api/admin/instances'),
        fetch('/api/admin/users'),
      ]);
      setInstances(await instRes.json());
      setUsers(await usersRes.json());
    } catch {
      addToast('Erro ao carregar dados.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ──────────────────────────────────────────
  // Toast helpers
  // ──────────────────────────────────────────
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ──────────────────────────────────────────
  // Computed stats
  // ──────────────────────────────────────────
  const stats = useMemo(() => {
    const idle = instances.filter((i) => i.status === 'IDLE');
    return {
      total: instances.length,
      idle: idle.length,
      inUse: instances.filter((i) => i.status === 'IN_USE').length,
      disabled: instances.filter((i) => i.status === 'DISABLED').length,
      trialIdle: idle.filter((i) => i.plan === 'TRIAL').length,
      paidIdle: idle.filter((i) => i.plan === 'PAID').length,
    };
  }, [instances]);

  // ──────────────────────────────────────────
  // Filtered list
  // ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return instances.filter((inst) => {
      const matchSearch =
        !search ||
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.instanceKey.toLowerCase().includes(search.toLowerCase()) ||
        inst.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        inst.user?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || inst.status === filterStatus;
      const matchPlan = filterPlan === 'ALL' || inst.plan === filterPlan;
      const matchProvider = filterProvider === 'ALL' || inst.provider === filterProvider;
      return matchSearch && matchStatus && matchPlan && matchProvider;
    });
  }, [instances, search, filterStatus, filterPlan, filterProvider]);

  // ──────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────
  const handleAddInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: '', provider: 'ULTRAMSG', instanceKey: '', apiToken: '', plan: 'TRIAL' });
        addToast('Instância adicionada ao pool.', 'success');
        fetchAll();
      } else {
        const { error } = await res.json();
        addToast(error || 'Erro ao adicionar instância.', 'error');
      }
    } catch {
      addToast('Erro de conexão.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: string, extra?: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/admin/instances', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extra }),
      });
      if (res.ok) {
        const labels: Record<string, string> = {
          unlink: 'Instância desvinculada.',
          disable: 'Instância desativada.',
          enable: 'Instância reativada.',
          assign: 'Instância atribuída com sucesso.',
        };
        addToast(labels[action] ?? 'Ação executada.', 'success');
        fetchAll();
      } else {
        const { error } = await res.json();
        addToast(error || 'Erro na ação.', 'error');
      }
    } catch {
      addToast('Erro de conexão.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir permanentemente esta instância?')) return;
    try {
      const res = await fetch(`/api/admin/instances?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Instância excluída.', 'success');
        fetchAll();
      }
    } catch {
      addToast('Erro ao excluir.', 'error');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ──────────────────────────────────────────
  // Render helpers
  // ──────────────────────────────────────────
  const selectClass =
    'w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#6C5DD3] transition-colors outline-none appearance-none text-sm';

  return (
    <div className="space-y-8 animate-fade-in">
      <ToastList toasts={toasts} onRemove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      {assignTarget && (
        <AssignModal
          instance={assignTarget}
          users={users}
          onClose={() => setAssignTarget(null)}
          onAssign={async (instId, userId) => handleAction(instId, 'assign', { userId })}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Pool de Instâncias</h2>
          <p className="text-[#9CA3AF] mt-1">Gerencie conexões UltraMsg e WaSender disponíveis para clientes.</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#6C5DD3] hover:bg-[#5a4caf]"
        >
          {showAddForm ? (
            <><X size={16} className="mr-2" /> Fechar</>
          ) : (
            <><Plus size={16} className="mr-2" /> Adicionar Instância</>
          )}
        </Button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total no Pool', value: stats.total, color: '#6C5DD3', bg: 'bg-[#6C5DD3]/10' },
          { label: 'Disponíveis', value: stats.idle, color: '#00E5A0', bg: 'bg-[#00E5A0]/10' },
          { label: 'Em Uso', value: stats.inUse, color: '#3B82F6', bg: 'bg-[#3B82F6]/10' },
          { label: 'Desativadas', value: stats.disabled, color: '#EF4444', bg: 'bg-[#EF4444]/10' },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <Server size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[#6B7280] text-xs font-medium">{s.label}</p>
              <p className="text-white text-2xl font-black leading-none mt-0.5">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Alerta de Pool Baixo ── */}
      {stats.trialIdle < 2 && (
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl px-5 py-4 flex items-center gap-4">
          <AlertTriangle size={20} className="text-[#F59E0B] shrink-0" />
          <div className="flex-1">
            <p className="text-[#F59E0B] font-bold text-sm">Pool Trial Baixo</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5">
              Apenas <strong>{stats.trialIdle}</strong> instância(s) TRIAL disponível(is).
              Novos cadastros não conseguirão ser atribuídos. Adicione mais instâncias.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddForm(true)} className="shrink-0 bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/30">
            Adicionar
          </Button>
        </div>
      )}

      {/* ── Formulário Adicionar ── */}
      {showAddForm && (
        <Card className="border-[#6C5DD3]/30 bg-[#6C5DD3]/5 animate-slide-up">
          <h3 className="text-white font-bold mb-5 flex items-center gap-2">
            <Plus size={16} className="text-[#6C5DD3]" /> Nova Instância no Pool
          </h3>
          <form onSubmit={handleAddInstance} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Nome Identificador</label>
              <Input
                placeholder="Ex: Ultra-Trial-01"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Provedor</label>
              <select
                className={selectClass}
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              >
                <option value="ULTRAMSG">UltraMsg</option>
                <option value="WASENDER">WaSender</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Plano Destinado</label>
              <select
                className={selectClass}
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              >
                <option value="TRIAL">Trial (Gratuito)</option>
                <option value="PAID">Paid (Assinante)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Instance ID / Key</label>
              <Input
                placeholder="ID fornecido pelo provedor"
                value={formData.instanceKey}
                onChange={(e) => setFormData({ ...formData, instanceKey: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Token de API</label>
              <Input
                placeholder="Token de autenticação"
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancelar</Button>
              <Button type="submit" isLoading={isSubmitting} className="px-8 bg-[#6C5DD3] hover:bg-[#5a4caf]">
                Salvar Instância
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#6C5DD3] transition-colors"
            placeholder="Buscar por nome, key, usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {[
            { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: ['ALL', 'IDLE', 'IN_USE', 'DISABLED'] },
            { label: 'Plano', value: filterPlan, onChange: setFilterPlan, options: ['ALL', 'TRIAL', 'PAID'] },
            { label: 'Provedor', value: filterProvider, onChange: setFilterProvider, options: ['ALL', 'ULTRAMSG', 'WASENDER'] },
          ].map((f) => (
            <div key={f.label} className="relative">
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-[#6C5DD3] transition-colors cursor-pointer"
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o} value={o} className="bg-[#111827]">
                    {o === 'ALL' ? `Todos ${f.label}` : o === 'IN_USE' ? 'Em Uso' : o === 'IDLE' ? 'Disponível' : o === 'DISABLED' ? 'Inativa' : o}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Grid de Instâncias ── */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#6C5DD3]" />
          <p className="text-[#6B7280] font-medium">Carregando pool...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-60">
          <Smartphone size={48} className="text-[#6B7280]" />
          <div>
            <h3 className="text-white font-bold text-lg">
              {instances.length === 0 ? 'Pool Vazio' : 'Nenhum resultado'}
            </h3>
            <p className="text-[#6B7280] text-sm mt-1">
              {instances.length === 0
                ? 'Adicione instâncias para atribuir aos clientes.'
                : 'Tente ajustar os filtros de busca.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inst) => {
            const borderColor =
              inst.status === 'IN_USE' ? 'border-l-[#00E5A0]' :
              inst.status === 'DISABLED' ? 'border-l-[#EF4444]' : 'border-l-[#6C5DD3]';
            const isCopied = copiedId === inst.id;

            return (
              <Card
                key={inst.id}
                className={`border-l-4 ${borderColor} hover:-translate-y-1 transition-all duration-300 flex flex-col`}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${inst.plan === 'PAID' ? 'bg-[#00E5A0]/10 text-[#00E5A0]' : 'bg-[#6C5DD3]/10 text-[#6C5DD3]'}`}>
                      <Smartphone size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white leading-none truncate">{inst.name}</h4>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{inst.provider}</span>
                    </div>
                  </div>
                  <Badge variant={inst.status === 'IN_USE' ? 'green' : inst.status === 'DISABLED' ? 'red' : 'gray'} className="shrink-0 ml-2">
                    {inst.status === 'IN_USE' ? 'EM USO' : inst.status === 'DISABLED' ? 'INATIVA' : 'DISPONÍVEL'}
                  </Badge>
                </div>

                {/* Card Details */}
                <div className="space-y-3 mb-5 flex-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6B7280]">Plano:</span>
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${inst.plan === 'PAID' ? 'bg-[#00E5A0]/10 text-[#00E5A0]' : 'bg-[#6C5DD3]/10 text-[#6C5DD3]'}`}>
                      {inst.plan}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6B7280]">Mensagens:</span>
                    <span className="text-white font-mono text-xs">
                      {inst.messageCount}
                      <span className="text-[#6B7280]"> / {inst.plan === 'TRIAL' ? '100' : '∞'}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6B7280]">Adicionada:</span>
                    <span className="text-[#9CA3AF] text-xs">{formatDate(inst.createdAt)}</span>
                  </div>

                  {/* Instance Key com cópia */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6B7280]">Instance Key:</span>
                    <button
                      onClick={() => handleCopy(inst.instanceKey, inst.id)}
                      className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-white transition-colors group"
                    >
                      <span className="font-mono text-xs">{truncate(inst.instanceKey, 14)}</span>
                      {isCopied ? (
                        <Check size={12} className="text-[#00E5A0]" />
                      ) : (
                        <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>

                  {/* Usuário Vinculado */}
                  <div className="pt-3 border-t border-white/5">
                    {inst.user ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#00E5A0]/10 flex items-center justify-center text-[#00E5A0] font-bold text-xs shrink-0">
                          {inst.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-bold truncate">{inst.user.name}</p>
                          <p className="text-[#6B7280] text-[10px] truncate">{inst.user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#6B7280] text-xs italic flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#6B7280]" />
                        Sem usuário vinculado
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                  {inst.status === 'IDLE' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAssignTarget(inst)}
                        className="text-[#6C5DD3] hover:bg-[#6C5DD3]/10 col-span-2"
                      >
                        <UserPlus size={13} className="mr-2" /> Atribuir Usuário
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(inst.id, 'disable')}
                        className="text-[#6B7280] hover:text-white"
                      >
                        <Power size={13} className="mr-1.5" /> Desativar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(inst.id)}
                        className="text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5"
                      >
                        <Trash2 size={13} className="mr-1.5" /> Excluir
                      </Button>
                    </>
                  )}

                  {inst.status === 'IN_USE' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(inst.id, 'unlink')}
                        className="text-[#EF4444] hover:bg-[#EF4444]/10"
                      >
                        <Link2Off size={13} className="mr-1.5" /> Desvincular
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(inst.id)}
                        className="text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5"
                      >
                        <Trash2 size={13} className="mr-1.5" /> Excluir
                      </Button>
                    </>
                  )}

                  {inst.status === 'DISABLED' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(inst.id, 'enable')}
                        className="text-[#00E5A0] hover:bg-[#00E5A0]/10"
                      >
                        <Power size={13} className="mr-1.5" /> Reativar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(inst.id)}
                        className="text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5"
                      >
                        <Trash2 size={13} className="mr-1.5" /> Excluir
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Legenda do Pool ── */}
      <div className="bg-[#6C5DD3]/10 border border-[#6C5DD3]/20 rounded-2xl p-5 flex gap-4">
        <ShieldCheck className="text-[#6C5DD3] shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Como funciona o Pool?</h4>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Instâncias <strong>TRIAL</strong> são atribuídas automaticamente a novos usuários no cadastro.
            Instâncias <strong>PAID</strong> são usadas após conversão por assinatura via Stripe.
            Use o botão <strong>Atribuir Usuário</strong> para vincular manualmente qualquer instância disponível.
            Mantenha sempre <strong>2+ instâncias TRIAL</strong> disponíveis para novos cadastros.
          </p>
          <div className="flex gap-6 pt-2 text-xs text-[#6B7280]">
            <span>Trial disponíveis: <strong className="text-[#6C5DD3]">{stats.trialIdle}</strong></span>
            <span>Paid disponíveis: <strong className="text-[#00E5A0]">{stats.paidIdle}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
