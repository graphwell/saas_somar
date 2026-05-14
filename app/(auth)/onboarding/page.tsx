"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  Bot,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Briefcase,
  Heart,
  Scale,
  CheckCircle2,
  QrCode,
  Loader2,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type QrStatus = 'idle' | 'loading' | 'qrCode' | 'connected' | 'no_instance' | 'error';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [businessData, setBusinessData] = useState({ name: '', segment: '', location: '' });
  const [agentData, setAgentData] = useState({ name: '', tone: 'neutral', services: '' });

  // QR Code state
  const [qrStatus, setQrStatus] = useState<QrStatus>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQr = async () => {
    try {
      const res = await fetch('/api/user/whatsapp/qr');
      const data = await res.json();
      setQrStatus(data.status === 'connected' ? 'connected' : data.status === 'qrCode' ? 'qrCode' : data.status === 'no_instance' ? 'no_instance' : data.status === 'loading' ? 'loading' : 'error');
      setQrCode(data.qrCode ?? null);
    } catch {
      setQrStatus('error');
    }
  };

  // Buscar QR ao entrar no passo 3
  useEffect(() => {
    if (step !== 3) return;
    setQrStatus('loading');
    fetchQr();
    pollRef.current = setInterval(fetchQr, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessData.name,
          segment: businessData.segment,
          location: businessData.location,
          agentName: agentData.name || 'Assistente',
          agentTone: agentData.tone,
          agentServices: agentData.services,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error('Onboarding error:', data.error);
      }
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] py-12 px-6 flex flex-col items-center">
      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-12">
        <div className="flex justify-between items-center mb-4 px-2">
          {[
            { id: 1, icon: Building, label: 'Negócio' },
            { id: 2, icon: Bot, label: 'Sua IA' },
            { id: 3, icon: Smartphone, label: 'WhatsApp' },
          ].map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${step >= item.id ? 'bg-[#00E5A0] text-[#0A0F1E] shadow-[0_0_15px_rgba(0,229,160,0.4)]' : 'bg-white/5 text-[#6B7280]'}`}>
                <item.icon size={18} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= item.id ? 'text-[#00E5A0]' : 'text-[#6B7280]'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
          <div 
            className="absolute h-full bg-[#00E5A0] transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* PASSO 1: SEU NEGÓCIO */}
        {step === 1 && (
          <Card className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2">Sobre o seu negócio</h2>
            <p className="text-[#9CA3AF] text-sm mb-8">Vamos começar com o básico para personalizar sua IA.</p>
            
            <div className="space-y-6">
              <Input 
                label="Nome do seu negócio" 
                placeholder="Ex: Salão da Maria" 
                required
                icon={<Building size={18} />}
                value={businessData.name}
                onChange={e => setBusinessData({...businessData, name: e.target.value})}
              />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#6B7280]">Segmento</label>
                <select 
                  className="bg-[#111827] border border-white/10 rounded-[8px] py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/20 transition-base"
                  value={businessData.segment}
                  onChange={e => setBusinessData({...businessData, segment: e.target.value})}
                >
                  <option value="">Selecione um segmento</option>
                  <option value="beleza">Beleza e Estética</option>
                  <option value="saude">Saúde e Bem-estar</option>
                  <option value="alimentacao">Alimentação</option>
                  <option value="servicos">Serviços em Geral</option>
                </select>
              </div>

              <Input 
                label="Cidade / Estado" 
                placeholder="Ex: São Paulo / SP" 
                icon={<MapPin size={18} />}
                value={businessData.location}
                onChange={e => setBusinessData({...businessData, location: e.target.value})}
              />
            </div>
          </Card>
        )}

        {/* PASSO 2: SUA IA */}
        {step === 2 && (
          <Card className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2">Configure sua IA</h2>
            <p className="text-[#9CA3AF] text-sm mb-8">Dê personalidade ao seu novo assistente virtual.</p>

            <div className="space-y-8">
              <Input 
                label="Como se chama sua IA?" 
                placeholder="Ex: Assistente Bella" 
                required
                icon={<Bot size={18} />}
                value={agentData.name}
                onChange={e => setAgentData({...agentData, name: e.target.value})}
              />

              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium text-[#6B7280]">Tom de Voz</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'formal', label: 'Formal', desc: 'Direto e profissional', icon: Briefcase },
                    { id: 'friendly', label: 'Amigável', desc: 'Próximo e leve', icon: Heart },
                    { id: 'neutral', label: 'Neutro', desc: 'Equilibrado', icon: Scale },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAgentData({...agentData, tone: t.id as any})}
                      className={`
                        flex flex-col items-center gap-3 p-4 rounded-[12px] border transition-base
                        ${agentData.tone === t.id ? 'bg-[#00E5A0]/10 border-[#00E5A0] text-white shadow-[0_0_10px_rgba(0,229,160,0.1)]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}
                      `}
                    >
                      <t.icon size={24} />
                      <div className="text-center">
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[9px] mt-1">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#6B7280]">Quais serviços ou produtos você oferece?</label>
                <textarea 
                  className="w-full bg-[#111827] border border-white/10 rounded-[8px] py-2 px-3 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/20 transition-base min-h-[100px]"
                  placeholder="Ex: Cortes de cabelo, coloração, tratamentos faciais..."
                  value={agentData.services}
                  onChange={e => setAgentData({...agentData, services: e.target.value})}
                />
              </div>
            </div>
          </Card>
        )}

        {/* PASSO 3: CONECTAR WHATSAPP */}
        {step === 3 && (
          <Card className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2">Agora, o toque final</h2>
            <p className="text-[#9CA3AF] text-sm mb-10">Conecte seu WhatsApp para começar a atender.</p>

            <div className="md:flex gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  {[
                    "Abra o WhatsApp no seu celular",
                    "Toque em aparelhos conectados",
                    "Clique em conectar um aparelho",
                    "Aponte a câmera para o QR Code"
                  ].map((txt, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-white/80">{txt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Badge variant="amber" className="px-3 py-1">
                    <Smartphone size={10} className="mr-2" />
                    Pode ser feito depois no painel
                  </Badge>
                </div>
              </div>

              {/* QR CODE REAL */}
              <div className="flex flex-col items-center gap-4 mt-12 md:mt-0 p-8 rounded-2xl bg-white/[0.02] border border-white/5 min-w-[220px]">
                {qrStatus === 'connected' ? (
                  <>
                    <div className="w-48 h-48 bg-[#00E5A0]/10 border-2 border-[#00E5A0]/40 rounded-xl flex flex-col items-center justify-center gap-3">
                      <Wifi size={48} className="text-[#00E5A0]" />
                      <span className="text-xs font-bold text-[#00E5A0]">Conectado!</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#00E5A0]">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-bold uppercase tracking-widest">WhatsApp Ativo</span>
                    </div>
                  </>
                ) : qrStatus === 'qrCode' && qrCode ? (
                  <>
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCode} alt="QR Code WhatsApp" className="w-44 h-44 object-contain" />
                    </div>
                    <div className="flex items-center gap-2 text-[#6C5DD3] text-xs">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Atualizando a cada 8s...</span>
                    </div>
                  </>
                ) : qrStatus === 'no_instance' ? (
                  <div className="w-48 h-48 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <QrCode size={36} className="text-[#F59E0B]" />
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">Instância sendo configurada. Conecte depois em <strong className="text-white">/whatsapp</strong>.</p>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-white/5 rounded-xl flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-[#6C5DD3]" />
                    <span className="text-xs text-[#6B7280]">Carregando QR Code...</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* CONTROLS */}
        <div className="flex justify-between items-center gap-4 mt-6">
          {step > 1 ? (
            <Button variant="ghost" onClick={prevStep} className="gap-2">
              <ChevronLeft size={18} /> Voltar
            </Button>
          ) : <div />}

          {step < 3 ? (
            <Button size="lg" onClick={nextStep} className="px-10 text-base font-bold shadow-2xl">
              Continuar <ChevronRight size={18} className="ml-1" />
            </Button>
          ) : (
            <Button size="lg" onClick={handleFinish} isLoading={isLoading} className="px-12 text-base font-bold bg-white text-[#0A0F1E] hover:bg-white/90">
              Ir para o painel <CheckCircle2 size={18} className="ml-2" />
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}

