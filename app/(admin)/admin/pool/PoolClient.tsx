"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Trash2, 
  UserPlus, 
  Server, 
  ShieldCheck, 
  Loader2, 
  ChevronRight,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { addInstanceToPool, assignInstanceToUser, deleteInstance } from './actions';

interface PoolClientProps {
  users: { id: string; nome: string; email: string }[];
  instances: any[];
}

export default function PoolClient({ users }: PoolClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await addInstanceToPool(formData);
      if (res.success) setIsAddModalOpen(false);
      else alert('Erro: ' + res.error);
    } catch (err) {
      alert('Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsAddModalOpen(true)} className="font-bold gap-2">
        <Plus size={18} /> Nova Instância Pool
      </Button>

      {/* Modal Adicionar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <Card className="relative w-full max-w-lg p-0 border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00E5A0]/10 flex items-center justify-center text-[#00E5A0]">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Adicionar ao Pool</h3>
                  <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Nova conexão demo</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-[#6B7280] transition-base">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-8 space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Provedor</label>
                <select 
                  name="provider" 
                  className="w-full bg-[#111827] border border-white/10 rounded-[8px] py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base"
                >
                  <option value="wasender">Wasender API</option>
                  <option value="ultramsg">UltraMsg API</option>
                </select>
              </div>

              <Input label="Instance ID" name="instanceId" placeholder="Ex: somar_trial_01" required />
              <Input label="Token de Acesso" name="token" placeholder="Insira o Token do Provedor" required />
              <Input label="Webhook Customizado (Opcional)" name="webhookUrl" placeholder="https://..." />

              <div className="pt-4 flex gap-3">
                 <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                 <Button type="submit" className="flex-1 font-bold" isLoading={isLoading}>Salvar no Pool</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

// Subcomponente para as ações de cada linha da tabela — exportado separadamente
export function PoolActions({ instanceId, isAssigned }: { instanceId: string; isAssigned: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Deseja realmente excluir esta instância do pool?')) return;
    setLoading(true);
    await deleteInstance(instanceId);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
       {!isAssigned && (
         <Button variant="ghost" size="sm" className="p-2 text-[#00E5A0] hover:bg-[#00E5A0]/10">
           <UserPlus size={14} />
         </Button>
       )}
       <Button variant="ghost" size="sm" onClick={handleDelete} isLoading={loading} className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10">
         <Trash2 size={14} />
       </Button>
    </div>
  );
}

