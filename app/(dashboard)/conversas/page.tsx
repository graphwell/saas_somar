"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  ExternalLink,
  MoreVertical,
  Send,
  UserCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const mockConversations = [
  { id: 1, name: 'Ricard...', phone: '+55 11 ••••-7665', lastMsg: 'Qual o valor do corte?', time: '14:20', status: 'aberta', unread: 2 },
  { id: 2, name: 'Cláudi...', phone: '+55 21 ••••-4321', lastMsg: 'Obrigada pelo atendimento!', time: '12:05', status: 'encerrada', unread: 0 },
  { id: 3, name: 'Marcos', phone: '+55 31 ••••-1122', lastMsg: 'Pode agendar para as 15h?', time: 'Ontem', status: 'transferida', unread: 0 },
  { id: 4, name: 'Juliana', phone: '+55 41 ••••-9900', lastMsg: 'Vocês aceitam cartão?', time: 'Ontem', status: 'aberta', unread: 1 },
  { id: 5, name: 'Fábio B.', phone: '+55 13 ••••-5544', lastMsg: 'A IA respondeu tudo, valeu.', time: 'Ontem', status: 'encerrada', unread: 0 },
];

const mockMessages = [
  { role: 'user', content: 'Olá, gostaria de saber os horários de amanhã.', time: '14:15' },
  { role: 'assistant', content: 'Olá! Amanhã temos horários disponíveis às 10h, 14h e 16h. Qual deles fica melhor para você?', time: '14:15' },
  { role: 'user', content: 'Qual o valor do corte?', time: '14:19' },
  { role: 'assistant', content: 'O corte masculino padrão está R$ 50,00. Deseja agendar para algum dos horários que mencionei?', time: '14:20' },
];

export default function ConversasPage() {
  const [activeTab, setActiveTab] = useState('todas');
  const [selectedChat, setSelectedChat] = useState<number | null>(1);

  const filteredConversations = mockConversations.filter(c => 
    activeTab === 'todas' || c.status === activeTab
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden animate-fade-in">
      {/* Sidebar List */}
      <div className="w-[380px] flex flex-col gap-4 h-full">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Conversas</h2>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {['todas', 'aberta', 'encerrada', 'transferida'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-base
                  ${activeTab === tab 
                    ? 'bg-[#00E5A0] text-[#0A0F1E] border-[#00E5A0]' 
                    : 'bg-white/5 text-[#6B7280] border-white/5 hover:bg-white/10 hover:text-white'
                  }
                `}
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
              className="w-full bg-white/5 border border-white/10 rounded-[12px] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/30 transition-base"
            />
          </div>
        </div>

        <Card className="flex-1 p-0 overflow-hidden flex flex-col border-white/5">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConversations.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`
                  p-4 flex items-start gap-4 border-b border-white/5 cursor-pointer transition-base group
                  ${selectedChat === chat.id ? 'bg-[#00E5A0]/5' : 'hover:bg-white/5'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                  ${chat.status === 'aberta' ? 'bg-[#00E5A0]/20 text-[#00E5A0]' : chat.status === 'transferida' ? 'bg-[#6C5DD3]/20 text-[#6C5DD3]' : 'bg-white/10 text-white/50'}
                `}>
                  {chat.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-bold truncate transition-colors ${selectedChat === chat.id ? 'text-[#00E5A0]' : 'text-white'}`}>
                      {chat.name}
                    </h4>
                    <span className="text-[10px] text-[#6B7280] whitespace-nowrap">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-[#9CA3AF] truncate leading-tight">{chat.lastMsg}</p>
                    {chat.unread > 0 && (
                      <span className="w-4 h-4 bg-[#00E5A0] text-[#0A0F1E] text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 flex flex-col gap-4 h-full min-w-0 relative">
        {selectedChat ? (
          <>
            <Card className="flex flex-col h-full p-0 border-white/5 overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">
                      {mockConversations.find(c => c.id === selectedChat)?.phone}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={mockConversations.find(c => c.id === selectedChat)?.status === 'aberta' ? 'green' : 'gray'}>
                        {mockConversations.find(c => c.id === selectedChat)?.status}
                      </Badge>
                      <span className="text-[10px] text-[#6B7280] font-medium">• IA Ativa</span>
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
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical size={18} />
                  </Button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed custom-scrollbar">
                {mockMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <div className={`
                        p-4 rounded-2xl text-sm leading-relaxed shadow-lg
                        ${msg.role === 'user' 
                          ? 'bg-[#1F2937] text-[#E5E7EB] rounded-tr-none border border-white/5' 
                          : 'bg-[#6C5DD3] text-white rounded-tl-none'
                        }
                      `}>
                        {msg.content}
                      </div>
                      <span className={`text-[9px] font-bold text-[#6B7280] uppercase tracking-tighter ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.time} {msg.role === 'assistant' ? '• IA' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Area (Manual takeover) */}
              <div className="p-6 border-t border-white/5 bg-[#0A0F1E]/50">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#00E5A0] uppercase tracking-widest bg-[#00E5A0]/10 px-2 py-0.5 rounded">Humano</span>
                    <span className="text-[10px] text-[#6B7280]">Você assumiu o controle desta conversa.</span>
                  </div>
                  <textarea 
                    className="w-full bg-transparent border-none text-sm text-white placeholder-[#6B7280] focus:ring-0 resize-none h-20 px-0"
                    placeholder="Digite sua mensagem aqui..."
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-[#6B7280]">Pressione Cmd+Enter para enviar</span>
                    <Button size="sm" className="rounded-full px-6 font-bold text-xs gap-2">
                        Enviar mensagem <Send size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card className="flex-1 flex flex-col items-center justify-center text-center p-12 border-white/5 border-dashed bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#6B7280] mb-6">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Selecione uma conversa</h3>
            <p className="text-sm text-[#6B7280] max-w-xs mx-auto">
              Clique em um chat na lista lateral para visualizar o histórico e assumir o controle se necessário.
            </p>
          </Card>
        )}
      </div>

    </div>
  );
}

