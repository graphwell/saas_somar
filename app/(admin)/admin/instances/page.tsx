'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Plus, 
  Trash2, 
  Link2Off, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Power
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminInstancesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    provider: 'ULTRAMSG',
    instanceKey: '',
    apiToken: '',
    plan: 'TRIAL'
  });

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/instances');
      const data = await res.json();
      setInstances(data);
    } catch (err) {
      console.error('Erro ao buscar instâncias:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleAddInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: '', provider: 'ULTRAMSG', instanceKey: '', apiToken: '', plan: 'TRIAL' });
        fetchInstances();
      }
    } catch (err) {
      console.error('Erro ao adicionar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    try {
      await fetch('/api/admin/instances', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      fetchInstances();
    } catch (err) {
      console.error('Erro na ação:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instância permanentemente?')) return;
    try {
      await fetch(`/api/admin/instances?id=${id}`, { method: 'DELETE' });
      fetchInstances();
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Pool de Instâncias</h2>
          <p className="text-[#9CA3AF] mt-1">Gerencie as conexões UltraMsg e WaSender disponíveis para os clientes.</p>
        </div>
        
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-[#6C5DD3] hover:bg-[#5a4caf]">
          {showAddForm ? 'Cancelar' : <><Plus size={18} className="mr-2" /> Adicionar Instância</>}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-[#6C5DD3]/30 bg-[#6C5DD3]/5 animate-slide-up">
          <form onSubmit={handleAddInstance} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Nome Identificador</label>
              <Input 
                placeholder="Ex: Ultra-Pool-01" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Provedor</label>
              <select 
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#6C5DD3] transition-colors outline-none appearance-none"
                value={formData.provider}
                onChange={e => setFormData({...formData, provider: e.target.value})}
              >
                <option value="ULTRAMSG">UltraMsg</option>
                <option value="WASENDER">WaSender</option>
                <option value="EVOLUTION">Evolution</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Plano Destinado</label>
              <select 
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#6C5DD3] transition-colors outline-none appearance-none"
                value={formData.plan}
                onChange={e => setFormData({...formData, plan: e.target.value})}
              >
                <option value="TRIAL">Trial (Gratuito)</option>
                <option value="PAID">Paid (Assinante)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Instance ID / Key</label>
              <Input 
                placeholder="ID do Provedor" 
                value={formData.instanceKey}
                onChange={e => setFormData({...formData, instanceKey: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Token de API</label>
              <Input 
                placeholder="Token de autenticação" 
                value={formData.apiToken}
                onChange={e => setFormData({...formData, apiToken: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button type="submit" isLoading={isSubmitting} className="px-8">Salvar Instância</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid de Instâncias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 size={40} className="animate-spin text-[#6C5DD3]" />
            <p className="text-[#6B7280] font-medium">Carregando pool de instâncias...</p>
          </div>
        ) : instances.length === 0 ? (
          <Card className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4 opacity-50">
            <Smartphone size={48} className="text-[#6B7280]" />
            <div>
              <h3 className="text-white font-bold text-lg">Pool Vazio</h3>
              <p className="text-[#6B7280] text-sm">Adicione instâncias para começar a atribuir aos clientes.</p>
            </div>
          </Card>
        ) : (
          instances.map((inst) => (
            <Card key={inst.id} className={`border-l-4 ${inst.status === 'IN_USE' ? 'border-l-[#00E5A0]' : inst.status === 'DISABLED' ? 'border-l-[#EF4444]' : 'border-l-[#6C5DD3]'} hover:translate-y-[-4px] transition-all duration-300`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${inst.plan === 'PAID' ? 'bg-[#00E5A0]/10 text-[#00E5A0]' : 'bg-[#6C5DD3]/10 text-[#6C5DD3]'}`}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg leading-none mb-1">{inst.name}</h4>
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{inst.provider}</span>
                  </div>
                </div>
                <Badge variant={inst.status === 'IN_USE' ? 'green' : inst.status === 'DISABLED' ? 'red' : 'gray'}>
                  {inst.status === 'IN_USE' ? 'EM USO' : inst.status === 'DISABLED' ? 'INATIVA' : 'DISPONÍVEL'}
                </Badge>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B7280]">Plano:</span>
                  <span className={`font-bold ${inst.plan === 'PAID' ? 'text-[#00E5A0]' : 'text-[#6C5DD3]'}`}>{inst.plan}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B7280]">Mensagens:</span>
                  <span className="text-white font-mono">{inst.messageCount} <span className="text-[#6B7280] text-xs">/ {inst.plan === 'TRIAL' ? '100' : '∞'}</span></span>
                </div>
                <div className="flex justify-between items-start text-sm">
                  <span className="text-[#6B7280]">Usuário:</span>
                  <div className="text-right">
                    {inst.user ? (
                      <div className="flex flex-col items-end">
                        <span className="text-white font-bold">{inst.user.name}</span>
                        <span className="text-[10px] text-[#6B7280]">{inst.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-[#6B7280] italic">Desvinculado</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
                {inst.status === 'IN_USE' ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAction(inst.id, 'unlink')}
                    className="text-[#EF4444] hover:bg-[#EF4444]/10"
                  >
                    <Link2Off size={14} className="mr-2" /> Desvincular
                  </Button>
                ) : inst.status === 'DISABLED' ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAction(inst.id, 'enable')}
                  >
                    <Power size={14} className="mr-2" /> Ativar
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAction(inst.id, 'disable')}
                  >
                    <Power size={14} className="mr-2" /> Desativar
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(inst.id)}
                  className="text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5"
                >
                  <Trash2 size={14} className="mr-2" /> Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="bg-[#6C5DD3]/10 border border-[#6C5DD3]/20 rounded-2xl p-6 flex gap-4">
        <ShieldCheck className="text-[#6C5DD3] shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Como funciona o Pool?</h4>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Instâncias marcadas como <b>TRIAL</b> são entregues automaticamente para novos usuários. 
            Instâncias <b>PAID</b> são usadas para migração manual após a assinatura do plano. 
            Mantenha sempre pelo menos 2-3 instâncias TRIAL disponíveis para novos cadastros.
          </p>
        </div>
      </div>
    </div>
  );
}
