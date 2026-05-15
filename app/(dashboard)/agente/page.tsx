"use client";

import React, { useState, useEffect } from 'react';
import {
  Bot, Briefcase, Heart, Scale, Save, Play, Pause,
  X, Send, Smartphone, CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ── Tipos ────────────────────────────────────────────────────────────
type Tone = 'formal' | 'friendly' | 'neutral';

interface Suggestion {
  label: string;
  identity: string;
  services: string;
  rules: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
function buildSystemPrompt(identity: string, services: string, rules: string): string {
  const parts: string[] = [];
  if (identity.trim()) parts.push(identity.trim());
  if (services.trim()) parts.push(`Sobre o que oferecemos:\n${services.trim()}`);
  if (rules.trim()) parts.push(`Instruções importantes:\n${rules.trim()}`);
  return parts.join('\n\n');
}

function parseSystemPrompt(prompt: string) {
  const serviceIdx = prompt.indexOf('Sobre o que oferecemos:');
  const rulesIdx = prompt.indexOf('Instruções importantes:');

  if (serviceIdx === -1 && rulesIdx === -1) {
    return { identity: prompt, services: '', rules: '' };
  }

  const identity = (serviceIdx !== -1 ? prompt.slice(0, serviceIdx) : prompt.slice(0, rulesIdx)).trim();
  let services = '';
  let rules = '';

  if (serviceIdx !== -1) {
    const start = serviceIdx + 'Sobre o que oferecemos:\n'.length;
    const end = rulesIdx !== -1 ? rulesIdx : prompt.length;
    services = prompt.slice(start, end).trim();
  }
  if (rulesIdx !== -1) {
    rules = prompt.slice(rulesIdx + 'Instruções importantes:\n'.length).trim();
  }

  return { identity, services, rules };
}

const SUGESTOES: Record<string, Suggestion> = {
  barbearia: {
    label: '✂️ Barbearia',
    identity: 'Sou o Corte Certo, atendente virtual da Barbearia do João. Atendemos de segunda a sábado, das 9h às 19h.',
    services: 'Serviços: Corte masculino (R$ 35), Barba (R$ 25), Corte + Barba (R$ 55), Progressiva (R$ 120).\nTodos os serviços são feitos com hora marcada.',
    rules: 'Sempre pergunte o nome do cliente e o serviço desejado.\nPara agendar, confirme o dia e horário disponível.\nNão aceite encaixe sem consultar o barbeiro.\nSe precisar falar com alguém, diga para ligar no (11) 99999-9999.',
  },
  estetica: {
    label: '💅 Estética / Salão',
    identity: 'Sou a Beleza em Dia, atendente virtual do Salão Studio Glow. Atendemos de terça a sábado, das 9h às 19h, com hora marcada.',
    services: 'Serviços: Manicure (R$ 40), Pedicure (R$ 45), Progressiva (R$ 150), Escova (R$ 60), Coloração (R$ 180), Design de sobrancelha (R$ 35).\nAceitamos Pix, cartão e dinheiro.',
    rules: 'Pergunte o nome da cliente e o serviço desejado.\nVerifique horários disponíveis antes de confirmar.\nNão faça o agendamento sem confirmar com a profissional.\nPara cancelamentos, informe que é necessário avisar com 24h de antecedência.',
  },
  clinica: {
    label: '🏥 Clínica / Consultório',
    identity: 'Sou a Saúde Fácil, atendente virtual da Clínica Bem Estar. Funcionamos de segunda a sexta, das 7h às 20h, e sábados das 8h às 13h.',
    services: 'Especialidades: Clínica Geral, Pediatria, Ginecologia e Cardiologia.\nAceitamos os principais planos de saúde e particular.\nConsultas a partir de R$ 150.',
    rules: 'Pergunte sempre o nome, data de nascimento e plano de saúde do paciente.\nNunca confirme diagnóstico ou prescreva medicamentos.\nPara urgências, oriente a ir à UPA mais próxima.\nPara falar com a recepção: (11) 99999-9999.',
  },
  restaurante: {
    label: '🍕 Restaurante / Delivery',
    identity: 'Sou o Sabor em Casa, atendente virtual do Restaurante Bom Gosto. Funcionamos de terça a domingo, das 11h às 23h.',
    services: 'Cardápio completo com pizzas, massas e grelhados.\nFazemos delivery com taxa de R$ 5 para até 3km.\nPedido mínimo para delivery: R$ 40.',
    rules: 'Pergunte o nome, endereço completo e forma de pagamento.\nInforme que o tempo médio de entrega é 40 a 60 minutos.\nNão aceite pedido se o endereço estiver fora da área de entrega.\nPara cancelamentos, transfira para o (11) 99999-9999.',
  },
  loja: {
    label: '🛍️ Loja / E-commerce',
    identity: 'Sou a Atende Bem, atendente virtual da Loja da Maria. Atendemos todos os dias, das 8h às 22h.',
    services: 'Vendemos roupas femininas, masculinas e infantis.\nEntregamos para todo o Brasil pelos Correios e transportadoras.\nFazemos trocas em até 30 dias após a compra.',
    rules: 'Pergunte o que o cliente procura e o tamanho desejado.\nPara rastreio de pedido, peça o número do pedido.\nNão prometa prazo de entrega sem consultar o sistema.\nPara reclamações, peça o e-mail do cliente para contato da equipe.',
  },
  imobiliaria: {
    label: '🏠 Imobiliária',
    identity: 'Sou o Lar Ideal, atendente virtual da Imobiliária Boa Vista. Atendemos de segunda a sexta, das 8h às 18h, e sábados das 9h às 13h.',
    services: 'Trabalhamos com venda e locação de imóveis residenciais e comerciais.\nTemos imóveis em vários bairros da cidade.\nRealizamos avaliação gratuita do seu imóvel.',
    rules: 'Pergunte se o cliente quer comprar, alugar ou anunciar um imóvel.\nPergunte o tipo de imóvel desejado, número de quartos e bairro de preferência.\nNunca informe valores sem antes consultar o corretor responsável.\nPara visitas, transfira para o atendente pelo (11) 99999-9999.',
  },
  oficina: {
    label: '🚗 Oficina / Mecânica',
    identity: 'Sou o Motor Amigo, atendente virtual da Oficina do Zé. Atendemos de segunda a sexta, das 8h às 18h, e sábados das 8h às 12h.',
    services: 'Serviços: Revisão completa, troca de óleo, alinhamento, balanceamento, freios, suspensão e elétrica veicular.\nTrabalhos com todas as marcas de veículos.',
    rules: 'Pergunte o nome do cliente, modelo do carro e o problema relatado.\nNunca dê orçamento sem o carro na oficina.\nInforme que o prazo médio de orçamento é 1 dia útil.\nPara reboque de emergência, passe o número: (11) 99999-9999.',
  },
  escola: {
    label: '🎓 Escola / Curso',
    identity: 'Sou o Saber Fácil, atendente virtual da Escola de Cursos Aprender Mais. Atendemos de segunda a sexta, das 8h às 21h, e sábados das 8h às 12h.',
    services: 'Oferecemos cursos de informática, inglês, corte e costura, design gráfico e panificação.\nAs turmas têm vagas limitadas e início todo mês.\nTemos opções presenciais e online.',
    rules: 'Pergunte qual curso o cliente tem interesse e se prefere presencial ou online.\nInforme os valores e a carga horária de cada curso.\nNunca confirme matrícula sem registrar no sistema com a secretaria.\nPara informações sobre bolsas, transfira para o (11) 99999-9999.',
  },
  petshop: {
    label: '🐾 Pet Shop / Veterinária',
    identity: 'Sou o Patinha Feliz, atendente virtual do Pet Shop e Clínica Veterinária Bem-te-vi. Atendemos de segunda a sábado, das 8h às 19h.',
    services: 'Serviços: Banho e tosa (a partir de R$ 50), consulta veterinária (R$ 120), vacinação, hospedagem e venda de rações e acessórios.\nAtendemos cães, gatos e pequenos animais.',
    rules: 'Pergunte o nome do tutor, o nome e a espécie do pet.\nPara consultas de urgência, oriente a ir diretamente à clínica.\nNunca prescreva medicamentos ou diagnóstico pelo WhatsApp.\nPara emergências fora do horário: (11) 99999-9999.',
  },
  academia: {
    label: '🏋️ Academia / Personal',
    identity: 'Sou o Força Total, atendente virtual da Academia Corpo em Forma. Funcionamos de segunda a sexta das 6h às 22h e sábados das 8h às 14h.',
    services: 'Modalidades: musculação, spinning, zumba, pilates e funcional.\nPlanos: mensal (R$ 89), trimestral (R$ 240) e anual (R$ 799).\nOferecemos avaliação física gratuita na primeira semana.',
    rules: 'Pergunte o nome e qual modalidade o cliente tem interesse.\nInforme que a primeira aula experimental é gratuita.\nPara alunos com restrição médica, oriente a apresentar atestado.\nPara trancamento ou cancelamento de plano: (11) 99999-9999.',
  },
  advocacia: {
    label: '⚖️ Advocacia / Jurídico',
    identity: 'Sou o Direito em Dia, atendente virtual do Escritório de Advocacia Lima & Associados. Atendemos de segunda a sexta, das 9h às 18h.',
    services: 'Áreas de atuação: Direito Trabalhista, Direito de Família, Previdenciário, Consumidor e Contratos.\nOferecemos consulta inicial gratuita de 30 minutos.',
    rules: 'Pergunte o nome do cliente e a área jurídica em que precisa de ajuda.\nNunca dê orientação jurídica diretamente pelo WhatsApp.\nInforme que toda consulta é sigilosa e coberta pelo sigilo profissional.\nPara agendar: (11) 99999-9999.',
  },
  contabilidade: {
    label: '📊 Contabilidade',
    identity: 'Sou o Conta Certa, atendente virtual do Escritório Contábil Números Certos. Atendemos de segunda a sexta, das 8h às 18h.',
    services: 'Serviços: abertura e encerramento de empresas, contabilidade mensal, declaração de imposto de renda, folha de pagamento e consultoria fiscal.\nAtendemos MEI, ME, EPP e profissionais liberais.',
    rules: 'Pergunte o nome do cliente e o tipo de empresa ou serviço desejado.\nNunca confirme alíquotas ou valores de impostos sem consultar o contador responsável.\nPara envio de documentos, oriente a usar o e-mail da empresa.\nPara falar com o contador: (11) 99999-9999.',
  },
};

const TONES: { id: Tone; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'formal',   label: 'Formal',   desc: 'Como um banco ou consultório',           icon: Briefcase },
  { id: 'friendly', label: 'Amigável', desc: 'Como um amigo que entende do negócio',   icon: Heart },
  { id: 'neutral',  label: 'Neutro',   desc: 'Direto ao ponto, sem formalidades',      icon: Scale },
];

// ── Tooltip ───────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center ml-1.5 cursor-help align-middle">
      <span className="text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors text-sm leading-none">ⓘ</span>
      <span className="pointer-events-none absolute left-6 top-0 z-50 hidden group-hover:block w-64 p-3 text-xs text-[#D1D5DB] bg-[#1F2937] border border-white/10 rounded-xl shadow-2xl leading-relaxed">
        {text}
      </span>
    </span>
  );
}

// ── Componente de campo ───────────────────────────────────────────────
function FieldBlock({
  label, tooltip, helper, value, onChange, rows, placeholder,
}: {
  label: string; tooltip: string; helper: string; value: string;
  onChange: (v: string) => void; rows: number; placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-sm font-semibold text-white inline-flex items-center">
          {label}
          <Tooltip text={tooltip} />
        </label>
        <p className="text-xs text-[#6B7280] mt-0.5">{helper}</p>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-[#111827] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/20 transition-all resize-none"
      />
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────
export default function AgentePage() {
  const [agentName, setAgentName]   = useState('');
  const [tone, setTone]             = useState<Tone>('friendly');
  const [identity, setIdentity]     = useState('');
  const [services, setServices]     = useState('');
  const [rules, setRules]           = useState('');
  const [temperature]               = useState(0.7);
  const [isActive, setIsActive]     = useState(true);
  const [isLoading, setIsLoading]   = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewMsg, setPreviewMsg] = useState('');
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/agent/config')
      .then(r => r.json())
      .then(data => {
        if (data.name) setAgentName(data.name);
        if (data.prompt) {
          const parsed = parseSystemPrompt(data.prompt);
          setIdentity(parsed.identity);
          setServices(parsed.services);
          setRules(parsed.rules);
        }
        if (typeof data.isActive === 'boolean') setIsActive(data.isActive);
      })
      .catch(() => {})
      .finally(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    const name = agentName.trim() || 'seu atendente';
    if (tone === 'friendly') {
      setPreviewMsg(`Olá! Sou ${name}, sua assistente virtual. 😊 Como posso te ajudar hoje?`);
    } else if (tone === 'formal') {
      setPreviewMsg(`Bom dia. Me chamo ${name} e estou aqui para te atender. Em que posso ser útil?`);
    } else {
      setPreviewMsg(`Olá. Sou ${name}. Como posso ajudar?`);
    }
  }, [agentName, tone]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/agent/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildSystemPrompt(identity, services, rules),
          temperature,
          settingsJson: { agentName: agentName || 'Assistente Virtual', tone },
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('/api/user/agent/toggle', { method: 'POST' });
      const data = await res.json();
      if (typeof data.isActive === 'boolean') setIsActive(data.isActive);
    } finally {
      setIsToggling(false);
    }
  };

  const applySuggestion = (key: string) => {
    const s = SUGESTOES[key];
    setIdentity(s.identity);
    setServices(s.services);
    setRules(s.rules);
    setPendingSuggestion(null);
  };

  const handleSuggestionClick = (key: string) => {
    const hasContent = identity.trim() || services.trim() || rules.trim();
    if (hasContent) {
      setPendingSuggestion(key);
    } else {
      applySuggestion(key);
    }
  };

  const clearAll = () => { setIdentity(''); setServices(''); setRules(''); };

  if (isFetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E5A0]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">

      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Seu Assistente no WhatsApp</h2>
        <p className="text-[#9CA3AF] mt-1">Configure como seu atendente virtual vai se apresentar e atender seus clientes.</p>
      </div>

      {/* Toggle ativo/pausado */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border transition-colors ${
        isActive ? 'border-green-500/30 bg-green-950/30' : 'border-red-500/30 bg-red-950/30'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="font-semibold text-white text-sm">
              {isActive ? 'Atendente ativo — respondendo clientes' : 'Atendente pausado — não está respondendo'}
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {isActive
              ? 'Seu WhatsApp está sendo atendido automaticamente pela IA.'
              : 'Os clientes não receberão resposta automática enquanto estiver pausado.'}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 ${
            isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isToggling
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : isActive
              ? <Pause size={14} />
              : <Play size={14} />}
          {isActive ? 'Pausar atendente' : 'Ativar atendente'}
        </button>
      </div>

      {/* Info comandos WhatsApp */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <p className="text-sm font-medium text-[#9CA3AF] mb-2">📱 Controle pelo próprio WhatsApp</p>
        <p className="text-xs text-[#6B7280] mb-3">
          Envie uma mensagem para o <strong className="text-white">seu próprio número</strong> no WhatsApp:
        </p>
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-lg bg-red-950/50 border border-red-900/50">
            <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Para pausar</p>
            <code className="text-red-300 text-sm">#parar</code>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-green-950/50 border border-green-900/50">
            <p className="text-[10px] text-green-400 font-bold uppercase mb-1">Para ativar</p>
            <code className="text-green-300 text-sm">#iniciar</code>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Coluna principal */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="space-y-8 shadow-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5A0]/5 blur-[100px] -z-10" />

            {/* Nome */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center border-b border-white/5 pb-8">
              <div className="w-20 h-20 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-[#6C5DD3] border-2 border-dashed border-[#6C5DD3]/40 shrink-0">
                <Bot size={36} />
              </div>
              <div className="flex-1 space-y-1.5">
                <Input
                  label="Nome do seu atendente"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  placeholder="Ex: Júlia, Pedro, Assistente..."
                />
                <p className="text-xs text-[#6B7280]">Seus clientes vão ver esse nome quando receberem resposta.</p>
              </div>
            </div>

            {/* Tom de voz */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Como ele vai conversar com seus clientes?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all relative text-center ${
                      tone === t.id
                        ? 'bg-[#00E5A0]/10 border-[#00E5A0] scale-[1.02] shadow-[0_0_20px_rgba(0,229,160,0.08)]'
                        : 'bg-white/5 border-white/5 text-[#6B7280] hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <t.icon size={24} className={tone === t.id ? 'text-[#00E5A0]' : 'opacity-40'} />
                    <div>
                      <div className={`text-xs font-bold mb-0.5 ${tone === t.id ? 'text-white' : ''}`}>{t.label}</div>
                      <div className="text-[10px] opacity-60 leading-tight">{t.desc}</div>
                    </div>
                    {tone === t.id && <CheckCircle2 size={12} className="text-[#00E5A0] absolute top-2 right-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Campos */}
            <div className="space-y-6 border-t border-white/5 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  O que seu atendente precisa saber
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SUGESTOES).map(key => (
                    <button
                      key={key}
                      onClick={() => handleSuggestionClick(key)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-[#6C5DD3]/10 border border-[#6C5DD3]/20 text-[#6C5DD3] hover:bg-[#6C5DD3]/20 transition-colors"
                    >
                      {SUGESTOES[key].label}
                    </button>
                  ))}
                  <button
                    onClick={clearAll}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#6B7280] hover:bg-white/10 transition-colors"
                  >
                    Limpar tudo
                  </button>
                </div>
              </div>

              <FieldBlock
                label="Quem é seu atendente?"
                tooltip="Apresente seu atendente com nome, nome do seu negócio e horário de funcionamento. Essa é a primeira coisa que a IA vai 'dizer' internamente para se identificar com os clientes."
                helper="Apresente seu atendente: nome, nome do negócio e horário de funcionamento."
                value={identity}
                onChange={setIdentity}
                rows={3}
                placeholder={"Ex: Sou a Júlia, atendente virtual da Ótica Visão Clara. Trabalho de segunda a sábado, das 8h às 18h."}
              />

              <FieldBlock
                label="O que você vende ou oferece?"
                tooltip="Liste seus produtos ou serviços com preços se possível. Quanto mais detalhes você colocar aqui, mais preciso o atendente será ao responder seus clientes."
                helper="Liste seus produtos, serviços e preços. Quanto mais detalhes, melhor o atendimento."
                value={services}
                onChange={setServices}
                rows={4}
                placeholder={"Ex: Vendemos óculos de grau, óculos de sol e lentes de contato. Fazemos exame de vista gratuito com agendamento. Temos promoções a partir de R$ 99."}
              />

              <FieldBlock
                label="Como deve agir com os clientes?"
                tooltip="Defina as regras do seu atendente: o que ele pode prometer, como lidar com reclamações, quando transferir para um humano e qual número ou canal usar para isso."
                helper="Regras importantes: o que pode e não pode fazer, como encaminhar casos especiais."
                value={rules}
                onChange={setRules}
                rows={4}
                placeholder={"Ex: Sempre pergunte o nome do cliente no início. Para orçamentos, peça o modelo desejado. Nunca prometa prazo de entrega. Se quiser falar com um humano, diga para ligar no (11) 99999-9999."}
              />
            </div>

            {/* Botões */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-4">
              <Button onClick={handleSave} isLoading={isLoading} className="px-10 h-12 rounded-full font-bold shadow-lg shadow-[#00E5A0]/10">
                <Save size={16} className="mr-2" />
                {saveSuccess ? 'Salvo!' : 'Salvar atendente'}
              </Button>
              <Button variant="ghost" onClick={() => setIsDrawerOpen(true)} className="px-10 h-12 rounded-full border-white/10 hover:bg-white/5">
                <Play size={16} className="mr-2" /> Testar
              </Button>
              {saveSuccess && (
                <span className="text-sm text-green-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Configurações salvas com sucesso!
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar preview */}
        <div className="xl:col-span-1">
          <div className="sticky top-8 space-y-6">
            <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-[0.2em] text-center">Preview</h3>

            {/* Phone mockup */}
            <div className="relative mx-auto w-[260px] h-[540px] bg-[#0A0F1E] border-[7px] border-[#1F2937] rounded-[44px] shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1F2937] rounded-b-[18px] z-20" />
              <div className="flex flex-col h-full bg-[#111827]">
                <div className="pt-7 pb-2.5 px-3 bg-[#1F2937] flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#6C5DD3] flex items-center justify-center text-white text-[9px] font-bold">
                    {(agentName.trim() || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">{agentName.trim() || 'Seu atendente'}</div>
                    <div className="text-[7px] text-[#00E5A0] font-bold uppercase tracking-widest">online</div>
                  </div>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  <div className="bg-[#1F2937] p-2.5 rounded-xl rounded-tl-none text-[11px] text-white leading-relaxed max-w-[90%]">
                    {previewMsg}
                  </div>
                  {identity.trim() && (
                    <div className="bg-[#1F2937] p-2.5 rounded-xl rounded-tl-none text-[10px] text-[#9CA3AF] leading-relaxed max-w-[90%]">
                      {identity.trim().slice(0, 90)}{identity.trim().length > 90 ? '…' : ''}
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-[#1F2937]/50 flex items-center gap-2">
                  <div className="flex-1 h-7 bg-[#1F2937] rounded-full px-2.5 text-[9px] text-[#6B7280] flex items-center">Mensagem...</div>
                  <div className="w-7 h-7 rounded-full bg-[#00E5A0] flex items-center justify-center text-[#0A0F1E]">
                    <Send size={11} fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-[#6C5DD3]/5 border-dashed border-[#6C5DD3]/30 p-4">
              <p className="text-[10px] text-[#9CA3AF] text-center font-medium leading-relaxed">
                Preview atualiza com <strong>Nome</strong> e <strong>Tom de Voz</strong> em tempo real.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Drawer de teste */}
      <div className={`fixed top-0 right-0 h-screen w-full sm:w-[440px] bg-[#0A0F1E] border-l border-white/10 z-50 shadow-2xl transition-all duration-500 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Smartphone size={18} className="text-[#00E5A0]" /> Simulador
            </h3>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 bg-[#111827] rounded-2xl p-5 border border-white/5 flex flex-col gap-3 overflow-y-auto">
            <div className="bg-[#1F2937] text-white p-3.5 rounded-xl rounded-tl-none text-sm self-start max-w-[85%]">
              {previewMsg}
            </div>
            <div className="bg-[#1F2937] text-white p-3.5 rounded-xl rounded-tl-none text-sm self-start max-w-[85%]">
              Como posso ajudar você hoje?
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Simular mensagem do cliente..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 px-5 pr-14 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/20 transition-all"
              />
              <button className="absolute right-2 top-2 w-9 h-9 rounded-full bg-[#00E5A0] flex items-center justify-center text-[#0A0F1E] hover:scale-105 active:scale-95 transition-transform">
                <Send size={16} fill="currentColor" />
              </button>
            </div>
            <p className="text-[9px] text-[#6B7280] text-center uppercase tracking-widest font-bold">Modo de Teste</p>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-fade-in" />
      )}

      {/* Modal de confirmação de sugestão */}
      {pendingSuggestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center text-2xl mb-4">
              {SUGESTOES[pendingSuggestion].label.split(' ')[0]}
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Aplicar sugestão?</h3>
            <p className="text-[#9CA3AF] text-sm mb-6 leading-relaxed">
              Isso vai <strong className="text-white">substituir</strong> o conteúdo atual dos 3 campos com o exemplo de{' '}
              <strong className="text-white">{SUGESTOES[pendingSuggestion].label}</strong>.
              O que você escreveu será perdido.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingSuggestion(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#9CA3AF] text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => applySuggestion(pendingSuggestion)}
                className="flex-1 py-2.5 rounded-xl bg-[#6C5DD3] text-white text-sm font-semibold hover:bg-[#5B4DC0] transition-colors"
              >
                Sim, aplicar exemplo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
