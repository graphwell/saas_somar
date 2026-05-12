"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MessageSquare,
  User,
  CheckCircle2,
  Send,
  UserCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type Session = {
  id: string;
  status: string;
  updatedAt: string;
  customer: { name: string | null; phone: string };
  messages: { content: string; role: string; createdAt: string }[];
};

type FullSession = {
  id: string;
  status: string;
  updatedAt: string;
  customer: { name: string | null; phone: string };
  messages: { id: string; role: string; content: string; createdAt: string }[];
};

const statusLabel: Record<string, string> = {
  active: 'ativa',
  human_handoff: 'transferida',
  closed: 'encerrada',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function ConversasPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState('todas');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullSession, setFullSession] = useState<FullSession | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/user/conversations');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    if (!selectedId) { setFullSession(null); return; }
    setLoadingChat(true);
    fetch(`/api/user/conversations/${selectedId}`)
      .then(r => r.json())
      .then(data => setFullSession(data))
      .catch(() => setFullSession(null))
      .finally(() => setLoadingChat(false));
  }, [selectedId]);

  const filtered = sessions.filter(s => {
    const matchTab =
      activeTab === 'todas' ||
      (activeTab === 'ativa' && s.status === 'active') ||
      (activeTab === 'encerrada' && s.status === 'closed') ||
      (activeTab === 'transferida' && s.status === 'human_handoff');
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.customer.phone.includes(q) ||
      (s.customer.name ?? '').toLowerCase().includes(q) ||
      (s.messages[0]?.content ?? '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const displayName = (s: Session) => s.customer.name ?? s.customer.phone;

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-[360px] flex flex-col gap-4 h-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">Conversas</h2>
            <button onClick={fetchSessions} className="text-[#6B7280] hover:text-white transition-colors p-1">
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['todas', 'ativa', 'encerrada', 'transferida'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-base ${
                  activeTab === tab
                    ? 'bg-[#00E5A0] text-[#0A0F1E] border-[#00E5A0]'
                    : 'bg-white/5 text-[#6B7280] border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
            <input
              type="text"
              placeholder="Buscar por número ou nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[12px] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base"
            />
          </div>
        </div>

        <Card className="flex-1 p-0 overflow-hidden flex flex-col border-white/5">
          {loadingList ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#6C5DD3]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 opacity-50">
              <MessageSquare size={32} className="text-[#6B7280]" />
              <p className="text-sm text-[#6B7280]">
                {sessions.length === 0 ? 'Nenhuma conversa ainda.' : 'Nenhum resultado.'}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {filtered.map(sess => (
                <div
                  key={sess.id}
                  onClick={() => setSelectedId(sess.id)}
                  className={`p-4 flex items-start gap-4 border-b border-white/5 cursor-pointer transition-base group ${
                    selectedId === sess.id ? 'bg-[#00E5A0]/5' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    sess.status === 'active' ? 'bg-[#00E5A0]/20 text-[#00E5A0]' :
                    sess.status === 'human_handoff' ? 'bg-[#6C5DD3]/20 text-[#6C5DD3]' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {displayName(sess)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-bold truncate transition-colors ${selectedId === sess.id ? 'text-[#00E5A0]' : 'text-white'}`}>
                        {displayName(sess)}
                      </h4>
                      <span className="text-[10px] text-[#6B7280] whitespace-nowrap">{timeAgo(sess.updatedAt)}</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] truncate leading-tight">
                      {sess.messages[0]?.content ?? 'Sem mensagens'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col gap-4 h-full min-w-0">
        {!selectedId ? (
          <Card className="flex-1 flex flex-col items-center justify-center text-center p-12 border-white/5 border-dashed bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#6B7280] mb-6">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Selecione uma conversa</h3>
            <p className="text-sm text-[#6B7280] max-w-xs mx-auto">
              Clique em um chat na lista lateral para visualizar o histórico.
            </p>
          </Card>
        ) : (
          <Card className="flex flex-col h-full p-0 border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">
                    {fullSession ? displayName(fullSession) : '—'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={fullSession?.status === 'active' ? 'green' : 'gray'}>
                      {statusLabel[fullSession?.status ?? ''] ?? fullSession?.status ?? '—'}
                    </Badge>
                    {fullSession?.status === 'active' && (
                      <span className="text-[10px] text-[#6B7280] font-medium">• IA Ativa</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase gap-2">
                  <UserCheck size={14} /> Assumir
                </Button>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase gap-2 text-[#EF4444] hover:text-[#EF4444] border-[#EF4444]/20 hover:bg-[#EF4444]/10">
                  <CheckCircle2 size={14} /> Encerrar
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#060910] custom-scrollbar">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin text-[#6C5DD3]" />
                </div>
              ) : !fullSession || fullSession.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                  <MessageSquare size={32} className="text-[#6B7280]" />
                  <p className="text-sm text-[#6B7280]">Nenhuma mensagem nesta conversa.</p>
                </div>
              ) : (
                fullSession.messages.map((msg, idx) => (
                  <div key={msg.id ?? idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-[#1F2937] text-[#E5E7EB] rounded-tr-none border border-white/5'
                          : msg.role === 'system'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B] text-xs border border-[#F59E0B]/20 rounded-xl'
                          : 'bg-[#6C5DD3] text-white rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className={`text-[9px] font-bold text-[#6B7280] uppercase tracking-tighter ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {msg.role === 'assistant' ? ' • IA' : msg.role === 'system' ? ' • Sistema' : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Área de resposta manual */}
            <div className="p-6 border-t border-white/5 bg-[#0A0F1E]/50">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#00E5A0] uppercase tracking-widest bg-[#00E5A0]/10 px-2 py-0.5 rounded">Humano</span>
                  <span className="text-[10px] text-[#6B7280]">Resposta manual (handoff ativo).</span>
                </div>
                <textarea
                  className="w-full bg-transparent border-none text-sm text-white placeholder-[#6B7280] focus:ring-0 resize-none h-20 px-0"
                  placeholder="Digite sua mensagem aqui..."
                />
                <div className="flex items-center justify-end pt-2 border-t border-white/5">
                  <Button size="sm" className="rounded-full px-6 font-bold text-xs gap-2">
                    Enviar <Send size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
