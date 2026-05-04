"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Upload, 
  Briefcase, 
  Heart, 
  Scale, 
  Save, 
  Play, 
  X, 
  Send,
  MessageCircle,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function AgentePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [agentName, setAgentName] = useState('Bella');
  const [tone, setTone] = useState('friendly');
  const [services, setServices] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Preview message generation
  const [previewMsg, setPreviewMsg] = useState('');

  useEffect(() => {
    fetch('/api/agent/config')
      .then(res => res.json())
      .then(data => {
        if (data.prompt) {
          // Tentar extrair dados do prompt ou settingsJson se houver estrutura
          setServices(data.prompt);
          setTemperature(data.temperature || 0.7);
        }
        setIsFetching(false);
      })
      .catch(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    let msg = '';
    if (tone === 'friendly') {
        msg = `Olá! Sou a ${agentName}, sua assistente virtual. 😊 Como posso te ajudar hoje?`;
    } else if (tone === 'formal') {
        msg = `Olá, bom dia. Me chamo ${agentName} e sou o assistente virtual da empresa. Em que posso ser útil?`;
    } else {
        msg = `Olá. Sou ${agentName}. Como posso ajudar?`;
    }
    setPreviewMsg(msg);
  }, [agentName, tone]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: services,
          temperature,
          settingsJson: { agentName, tone }
        })
      });
      if (response.ok) {
        // Tost de sucesso poderia entrar aqui
      }
    } catch (error) {
      console.error("Erro ao salvar agente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E5A0]"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in relative max-w-7xl mx-auto">

      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Configuração do Agente
        </h2>
        <p className="text-[#9CA3AF]">Define a identidade e o comportamento da sua IA no WhatsApp.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Config Column */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="flex flex-col gap-8 shadow-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5A0]/5 blur-[100px] -z-10" />

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-white/5 pb-8">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3] border-2 border-dashed border-[#6C5DD3]/40 group-hover:bg-[#6C5DD3]/20 transition-all duration-500 scale-100 group-hover:scale-105">
                  <Bot size={40} className="group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#00E5A0] flex items-center justify-center text-[#0A0F1E] shadow-lg group-hover:scale-110 transition-transform">
                  <Upload size={14} />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <Input 
                  label="Nome do Agente" 
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Ex: Assistente Bella"
                />
                <div className="flex items-center gap-2 text-[10px] text-[#6B7280] uppercase font-bold tracking-widest bg-white/5 w-fit px-2 py-1 rounded">
                   <AlertCircle size={12} className="text-[#6C5DD3]" /> Este nome aparecerá nas conversas automáticas.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-2">
                 Tom de Voz <div className="h-px flex-1 bg-white/5" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'formal', label: 'Formal', desc: 'Direto e profissional', icon: Briefcase },
                  { id: 'friendly', label: 'Amigável', desc: 'Próximo e descontraído', icon: Heart },
                  { id: 'neutral', label: 'Neutro', desc: 'Equilibrado e calmo', icon: Scale },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`
                      flex flex-col items-center gap-3 p-5 rounded-[20px] border transition-all duration-300 text-center relative overflow-hidden
                      ${tone === t.id 
                        ? 'bg-[#00E5A0]/10 border-[#00E5A0] shadow-[0_0_30px_rgba(0,229,160,0.1)] scale-[1.02]' 
                        : 'bg-white/5 border-white/5 text-[#6B7280] hover:bg-white/10 hover:border-white/10'}
                    `}
                  >
                    <t.icon size={28} className={tone === t.id ? 'text-[#00E5A0]' : 'opacity-40'} />
                    <div>
                      <div className={`text-xs font-black mb-1 tracking-tight ${tone === t.id ? 'text-white' : ''}`}>{t.label}</div>
                      <div className="text-[10px] leading-tight opacity-60 font-medium">{t.desc}</div>
                    </div>
                    {tone === t.id && (
                       <div className="absolute top-2 right-2">
                         <CheckCircle2 size={12} className="text-[#00E5A0]" />
                       </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-2">
                  Serviços e Regras <div className="h-px flex-1 bg-white/5" />
                  <HelpCircle size={14} className="text-[#6C5DD3] cursor-help" />
                </label>
                <div className="space-y-4">
                  <textarea 
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-[16px] py-4 px-5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/20 transition-all duration-300 min-h-[150px] shadow-inner"
                    placeholder="Descreva aqui o que sua IA faz, horários, preços e como ela deve se comportar..."
                  />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="gray" className="cursor-pointer hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3] transition-colors">Sugestão: Barbearia</Badge>
                    <Badge variant="gray" className="cursor-pointer hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3] transition-colors">Sugestão: Clínica Médica</Badge>
                    <Badge variant="gray" className="cursor-pointer hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3] transition-colors"> Sugestão: Imobiliária</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4">
              <Button onClick={handleSave} isLoading={isLoading} className="px-12 font-black tracking-tight h-12 rounded-full shadow-lg shadow-[#00E5A0]/10 hover:shadow-[#00E5A0]/20">
                <Save size={18} className="mr-2" /> Salvar Agente
              </Button>
              <Button variant="ghost" onClick={() => setIsDrawerOpen(true)} className="px-12 font-black tracking-tight h-12 rounded-full border-white/10 hover:bg-white/5">
                <Play size={18} className="mr-2" /> Teste Completo
              </Button>
            </div>
          </Card>
        </div>

        {/* Real-time Preview Sidebar (Module 8 Polish) */}
        <div className="space-y-8">
          <div className="sticky top-8 space-y-8">
            <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-[0.2em] text-center">Live Preview</h3>
            
            <div className="relative mx-auto w-[280px] h-[580px] bg-[#0A0F1E] border-[8px] border-[#1F2937] rounded-[48px] shadow-2xl overflow-hidden">
               {/* Phone UI Mockup */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1F2937] rounded-b-[20px] z-20" />
               
               <div className="flex flex-col h-full bg-[#111827]">
                  {/* WhatsApp Header */}
                  <div className="pt-8 pb-3 px-4 bg-[#1F2937] flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#6C5DD3] flex items-center justify-center text-white font-bold text-[10px]">
                        {agentName?.[0]}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-white leading-none">{agentName}</span>
                        <span className="text-[8px] text-[#00E5A0] font-bold uppercase tracking-widest mt-0.5">online</span>
                     </div>
                  </div>

                  {/* WhatsApp Body */}
                  <div className="flex-1 p-4 space-y-4 bg-[url('https://i.pinimg.com/originals/85/ec/a0/85eca08709ca48ce45d9cc0350d75c8a.png')] bg-contain opacity-80 overflow-y-auto custom-scrollbar">
                     <div className="flex justify-start">
                        <div className="max-w-[85%] bg-[#1F2937] p-3 rounded-2xl rounded-tl-none text-[12px] text-white shadow-md leading-relaxed animate-message-in">
                           {previewMsg}
                        </div>
                     </div>
                     
                     <div className="flex justify-start">
                        <div className="max-w-[85%] bg-[#1F2937] p-3 rounded-2xl rounded-tl-none text-[12px] text-white shadow-md leading-relaxed animate-message-in delay-500 opacity-0 fill-mode-forwards">
                           {services.length > 0 ? (
                             <>Seus serviços são: <br/> <strong>{services.slice(0, 50)}...</strong></>
                           ) : "(Aguardando preenchimento dos serviços...)"}
                        </div>
                     </div>
                  </div>

                  {/* WhatsApp Footer */}
                  <div className="p-3 bg-[#1F2937]/50 border-t border-white/5 flex items-center gap-2">
                     <div className="flex-1 h-8 bg-[#1F2937] rounded-full px-3 text-[10px] text-[#6B7280] flex items-center">Mensagem...</div>
                     <div className="w-8 h-8 rounded-full bg-[#00E5A0] flex items-center justify-center text-[#0A0F1E]"><Send size={14} fill="currentColor" /></div>
                  </div>
               </div>
            </div>

            <Card className="bg-[#6C5DD3]/5 border-dashed border-[#6C5DD3]/30 p-4">
              <p className="text-[10px] text-[#9CA3AF] leading-relaxed text-center font-medium">
                 Este preview reflete as alterações <br/> de <strong>Tom de Voz</strong> e <strong>Nome</strong> instantaneamente.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* REMAINDER DRAWER LOGIC (Same as before but refined) */}
      <div className={`
        fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-[#0A0F1E] border-l border-white/10 z-50 shadow-2xl transition-all duration-500 ease-in-out
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
         {/* ... Drawer Content ... */}
         <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold flex items-center gap-2"><Smartphone size={20} className="text-[#00E5A0]" /> Simulador Real</h3>
               <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/5 transition-base"><X size={24} /></button>
            </div>
            
            <div className="flex-1 bg-[#111827] rounded-3xl p-6 border border-white/5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
               <div className="bg-[#1F2937] text-white p-4 rounded-2xl rounded-tl-none text-sm self-start max-w-[85%]">
                  {previewMsg}
               </div>
               <div className="bg-[#1F2937] text-white p-4 rounded-2xl rounded-tl-none text-sm self-start max-w-[85%]">
                   Como posso ajudar você hoje? (Baseado no tom {tone})
               </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Simular mensagem do cliente..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/20 transition-base"
                />
                <button className="absolute right-2 top-2 w-10 h-10 rounded-full bg-[#00E5A0] flex items-center justify-center text-[#0A0F1E] hover:scale-105 active:scale-95 transition-base shadow-lg shadow-[#00E5A0]/20">
                   <Send size={18} fill="currentColor" />
                </button>
              </div>
              <p className="text-[9px] text-[#6B7280] text-center uppercase tracking-widest font-bold">Modo de Teste Isolado</p>
            </div>
         </div>
      </div>

      {isDrawerOpen && (
        <div onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-fade-in" />
      )}

    </div>
  );
}

