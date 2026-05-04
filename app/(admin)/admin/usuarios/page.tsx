"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Shield, 
  CheckCircle2, 
  XCircle,
  Edit,
  ArrowUpDown,
  Download,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const mockUsers = [
  { id: 1, name: 'João Ricardo', email: 'joao@barbearia.com', plan: 'PRO', status: 'Ativo', date: '12/03/2025' },
  { id: 2, name: 'Ana Beatriz', email: 'ana@clinica.com.br', plan: 'ENTERPRISE', status: 'Ativo', date: '10/03/2025' },
  { id: 3, name: 'Marcos Silva', email: 'contato@pedroshop.com', plan: 'FREE', status: 'Inativo', date: '05/03/2025' },
  { id: 4, name: 'Carla Lins', email: 'carla@estetica.com', plan: 'PRO', status: 'Ativo', date: '01/03/2025' },
  { id: 5, name: 'Fábio Souza', email: 'fabio@mecanica.com', plan: 'FREE', status: 'Pendente', date: '28/02/2025' },
  { id: 6, name: 'Luciana M.', email: 'lu@vendas.com', plan: 'PRO', status: 'Ativo', date: '25/02/2025' },
];

export default function UsuariosAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Gestão de Usuários</h2>
          <p className="text-[#9CA3AF]">Visualize e gerencie todos os clientes da plataforma Somar.IA.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest gap-2">
            <Download size={14} /> Exportar CSV
          </Button>
          <Button size="sm" className="font-bold gap-2">
            <Users size={16} /> Novo Usuário
          </Button>
        </div>
      </div>

      <Card className="p-0 border-white/5 overflow-hidden">
        {/* Filters Header */}
        <div className="p-6 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
              <input 
                 type="text" 
                 placeholder="Buscar por nome ou e-mail..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base"
              />
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto">
              <select className="bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base">
                 <option>Todos os Planos</option>
                 <option>Free</option>
                 <option>Pro</option>
                 <option>Enterprise</option>
              </select>
              <select className="bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base">
                 <option>Todos os Status</option>
                 <option>Ativo</option>
                 <option>Inativo</option>
                 <option>Pendente</option>
              </select>
              <Button variant="ghost" size="sm" className="p-2.5 border-white/10">
                 <Filter size={16} />
              </Button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-white/[0.01] border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                       <span className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                          Usuário <ArrowUpDown size={10} />
                       </span>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Plano</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Cadastro</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {mockUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.01] transition-base group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3] font-bold text-xs">
                                {user.name[0]}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-white group-hover:text-[#00E5A0] transition-colors">{user.name}</span>
                                <span className="text-[10px] text-[#6B7280]">{user.email}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <Badge variant={user.plan === 'ENTERPRISE' ? 'amber' : user.plan === 'PRO' ? 'green' : 'gray'}>
                             {user.plan}
                          </Badge>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                             {user.status === 'Ativo' ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00E5A0] uppercase tracking-tighter">
                                   <CheckCircle2 size={12} /> {user.status}
                                </div>
                             ) : user.status === 'Inativo' ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#EF4444] uppercase tracking-tighter">
                                   <XCircle size={12} /> {user.status}
                                </div>
                             ) : (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#F59E0B] uppercase tracking-tighter">
                                   <AlertCircle size={12} /> {user.status}
                                </div>
                             )}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-center text-[10px] text-[#6B7280] font-medium">
                          {user.date}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="sm" className="p-2 hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3]">
                                <Edit size={14} />
                             </Button>
                             <Button variant="ghost" size="sm" className="p-2 hover:bg-[#00E5A0]/10 hover:text-[#00E5A0]">
                                <Shield size={14} />
                             </Button>
                             <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10">
                                <MoreVertical size={14} />
                             </Button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
           <span className="text-[10px] text-[#6B7280] font-bold">MOSTRANDO 6 DE 342 USUÁRIOS</span>
           <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold border-white/10 disabled:opacity-30" disabled> ANTERIOR </Button>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold border-white/10"> PRÓXIMO </Button>
           </div>
        </div>
      </Card>

    </div>
  );
}

