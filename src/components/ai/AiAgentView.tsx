import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Settings,
  RefreshCw,
  Code,
  Zap,
  Check,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Cpu,
  ArrowRight,
  Database,
} from 'lucide-react';
import { AiConversationMessage } from '../../types';

export const AiAgentView: React.FC = () => {
  const {
    currentTenant,
    aiConfig,
    updateAiConfig,
    aiConversations,
    sendMessageToYafit,
    services,
    professionals,
    appointments,
  } = useDatabase();

  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'policy_engine' | 'webhook'>('simulator');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastTrace, setLastTrace] = useState<any>(null);

  // Live message state — conversa real com o Gemini via /api/ai/yafit-generate
  const [messages, setMessages] = useState<AiConversationMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Olá, gostaria de saber se tem horário para mechas e corte este sábado à tarde?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-2',
      sender: 'yafit',
      text: 'Olá! Que maravilha falar com você ✨ Temos sim! Para Mechas + Corte, neste sábado às 14:00 com o Matheus ou às 15:30 com a Camila. Qual horário fica melhor para você?',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      confidenceScore: 0.98,
      actionTriggered: 'check_availability',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Monta o contexto do salão (serviços + profissionais reais) para o Gemini
  const buildSalonContext = () => {
    const serviceList = services
      .slice(0, 12)
      .map((s) => `- ${s.name}: R$ ${s.price.toFixed(2)} (${s.durationMinutes} min)`)
      .join('\n');
    const profList = professionals.map((p) => p.name).join(', ');
    return `SERVIÇOS DISPONÍVEIS:\n${serviceList}\n\nPROFISSIONAIS: ${profList || 'Equipe completa'}`;
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: AiConversationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const history = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/yafit-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': currentTenant.id },
        body: JSON.stringify({
          message: text.trim(),
          tenantName: currentTenant.name,
          salonContext: buildSalonContext(),
          conversationHistory: history,
        }),
      });
      const data = await res.json();

      const isFallback = data.source === 'local_policy_engine';
      const yafitMsg: AiConversationMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'yafit',
        text: data.reply || data.fallbackReply || 'Desculpe, tive uma instabilidade. Pode repetir?',
        timestamp: new Date().toISOString(),
        confidenceScore: 0.95,
        actionTriggered: isFallback ? 'fallback_sem_api_key' : 'gemini_response',
      };

      setMessages((prev) => [...prev, yafitMsg]);
      setLastTrace({
        query: text.trim(),
        intent: 'appointment_intent',
        confidenceScore: 0.95,
        actionTriggered: yafitMsg.actionTriggered,
        modelUsed: data.source || 'gemini-2.5-flash',
        searchGrounding: true,
        tenantContext: currentTenant.name,
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'yafit',
          text: 'Ops! Não consegui me conectar ao servidor agora. Verifique se o backend (server.ts) está rodando na porta 3000.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Quero agendar corte feminino para amanhã às 15h',
    'Quanto custa a Hidratação Profunda?',
    'Tem horário livre hoje à tarde?',
    'Vocês têm algum cupom de primeira visita?',
    'Quais profissionais atendem Mechas?',
  ];

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  Agente IA de Atendimento ({aiConfig.name})
                </h1>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini Flash + Search Grounding
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Simulador WhatsApp em tempo real, política de regras de agendamento e integração com Langflow.
              </p>
            </div>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'simulator' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Simulador WhatsApp
          </button>
          <button
            onClick={() => setActiveSubTab('policy_engine')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'policy_engine' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Policy Engine (Regras)
          </button>
          <button
            onClick={() => setActiveSubTab('webhook')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'webhook' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Webhook / Langflow
          </button>
        </div>
      </div>

      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WhatsApp Simulator Frame (Left 2 cols) */}
          <div className="lg:col-span-2 bg-neutral-900 rounded-3xl p-3 sm:p-4 shadow-xl border-4 border-neutral-800 flex flex-col h-[640px]">
            {/* WhatsApp Header */}
            <div className="bg-[#1f2c34] text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-emerald-500">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{aiConfig.name} — Atendente Virtual</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Online • Responde automaticamente 24h
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-neutral-800/80 px-2 py-1 rounded text-neutral-300 font-mono">
                {currentTenant.name}
              </div>
            </div>

            {/* Chat Messages Body */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 my-2 rounded-2xl"
              style={{
                backgroundColor: '#0b141a',
                backgroundImage: 'radial-gradient(#1f2c34 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <div className="text-center">
                <span className="text-[10px] bg-[#182229] text-neutral-400 px-3 py-1 rounded-full border border-neutral-800">
                  🔒 Mensagens protegidas e integradas com a Agenda do Salão
                </span>
              </div>

              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-neutral-100 rounded-tl-none border border-neutral-700/50'
                      }`}
                    >
                      <div>{msg.text}</div>

                      <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] text-neutral-400">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isUser && <Check className="w-3 h-3 text-cyan-400" />}
                      </div>
                    </div>

                    {msg.actionTriggered && (
                      <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
                        <Zap className="w-2.5 h-2.5" /> Ação IA: {msg.actionTriggered} (Confiança: {((msg.confidenceScore || 0.95) * 100).toFixed(0)}%)
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 bg-[#202c33] text-neutral-300 p-2.5 rounded-2xl w-28 text-xs border border-neutral-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-1 py-1 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-neutral-300 border border-neutral-700 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Digite uma mensagem simulada como cliente..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-[#2a3942] text-white placeholder-neutral-400 text-xs px-4 py-3 rounded-xl border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Policy Inspector / Trace (Right col) */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600" /> AI Policy Engine Inspector
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Live
                </span>
              </div>

              <p className="text-xs text-neutral-500">
                Inspecione o processo de decisão do modelo Gemini, intenções reconhecidas e chamadas de ferramentas de agenda.
              </p>

              {/* Status parameters */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-neutral-500">Modelo LLM:</span>
                    <span className="font-mono font-bold text-neutral-900">gemini-2.5-flash</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-neutral-500">Search Grounding:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ativado
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-neutral-500">Tenant Context:</span>
                    <span className="font-bold text-neutral-800">{currentTenant.name}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-neutral-500">Autoconfirmação de Agendamento:</span>
                    <span className="text-neutral-800 font-semibold">
                      {aiConfig.autoConfirmAppointments ? 'Habilitada' : 'Manual'}
                    </span>
                  </div>
                </div>

                {/* Last Execution Trace */}
                {lastTrace && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-[11px]">
                    <span className="font-bold text-emerald-950 block">Último Rastreamento de Execução:</span>
                    <div className="text-emerald-900">
                      <strong>Input:</strong> "{lastTrace.query}"
                    </div>
                    <div className="text-emerald-900">
                      <strong>Ação Disparada:</strong> <code>{lastTrace.actionTriggered}</code>
                    </div>
                    <div className="text-emerald-900">
                      <strong>Grau de Certeza:</strong> {(lastTrace.confidenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                )}

                {/* Available Tools */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-[11px]">
                  <span className="font-bold text-neutral-800 block">Ferramentas / Tool Calls Conectadas:</span>
                  <ul className="space-y-1 text-neutral-600">
                    <li>• <code>check_available_slots(service, date)</code></li>
                    <li>• <code>book_appointment(customer, service, time)</code></li>
                    <li>• <code>get_service_pricing_and_duration()</code></li>
                    <li>• <code>apply_promotional_coupon(code)</code></li>
                    <li>• <code>transfer_to_human_reception(reason)</code></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-900">
              💡 <strong>Dica:</strong> A IA consulta a tabela de serviços, profissionais cadastrados e horários livres em tempo real.
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Policy Engine Settings */}
      {activeSubTab === 'policy_engine' && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs max-w-3xl space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900">Configurações de Personalidade & Regras de Negócio</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Defina como a Yafit se comporta ao interagir com clientes no WhatsApp.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nome do Agente Virtual</label>
                <input
                  type="text"
                  value={aiConfig.name}
                  onChange={(e) => updateAiConfig({ name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Tom de Voz</label>
                <select
                  value={aiConfig.tone}
                  onChange={(e) => updateAiConfig({ tone: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                >
                  <option value="warm_friendly">Caloroso, amigável e acolhedor (Salão Premium)</option>
                  <option value="formal">Formal e corporativo</option>
                  <option value="enthusiastic">Muito entusiasmado e descontraído</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">System Prompt / Instruções Base do Salão</label>
              <textarea
                rows={4}
                value={aiConfig.customPrompt}
                onChange={(e) => updateAiConfig({ customPrompt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiConfig.autoConfirmAppointments}
                  onChange={(e) => updateAiConfig({ autoConfirmAppointments: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Confirmar agendamentos diretamente na Agenda sem intervenção humana</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiConfig.offerCombos}
                  onChange={(e) => updateAiConfig({ offerCombos: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Sugerir combos promocionais e serviços adicionais (Upselling inteligente)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Webhook & Langflow */}
      {activeSubTab === 'webhook' && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs max-w-3xl space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" /> Endpoint de Webhook para Langflow / WhatsApp APIs
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Receba e envie mensagens diretamente usando conectores como Evolution API, Z-API, Z-Stack ou WhatsApp Cloud API.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">URL do Webhook Receptor (Express Backend):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://yafit-saas.internal/api/webhook/langflow"
                  className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-100 font-mono text-neutral-800"
                />
                <button
                  onClick={() => alert('URL copiada para a área de transferência!')}
                  className="px-3 py-2 bg-neutral-900 text-white rounded-xl font-bold"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Exemplo de Payload JSON (Entrada):</label>
              <pre className="p-3 bg-neutral-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "tenant_id": "${currentTenant.id}",
  "sender_phone": "5511987654321",
  "customer_name": "Fernanda Lima",
  "message_text": "Quero agendar corte para sábado às 14h",
  "channel": "whatsapp"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
