import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  MessageSquare,
  Bot,
  UserCheck,
  Send,
  Phone,
  Instagram,
  Globe,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  User,
  Scissors,
} from 'lucide-react';
import { AiConversation } from '../../types';

export const OmnichannelInboxView: React.FC = () => {
  const {
    currentTenant,
    aiConversations,
    updateConversationStatus,
    sendMessageToYafit,
    customers,
    services,
  } = useDatabase();

  const [selectedConvId, setSelectedConvId] = useState<string>(aiConversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'instagram'>('all');

  const selectedConv = aiConversations.find((c) => c.id === selectedConvId) || aiConversations[0];
  const customer = customers.find((c) => c.phone === selectedConv?.customerPhone);

  const filteredConversations = aiConversations.filter((c) => {
    return channelFilter === 'all' || c.channel === channelFilter;
  });

  const handleSendHumanMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;

    // Send as human attendant
    sendMessageToYafit(selectedConv.id, inputText.trim());
    setInputText('');
  };

  const handleToggleTakeover = () => {
    if (!selectedConv) return;
    const nextStatus = selectedConv.status === 'human_takeover' ? 'active_ai' : 'human_takeover';
    updateConversationStatus(selectedConv.id, nextStatus);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Atendimento Omnichannel & Inbox</h1>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
              {aiConversations.length} conversas ativas
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Centralize WhatsApp, Instagram Direct e Web Chat com transição suave entre IA e atendentes humanos.
          </p>
        </div>

        {/* Channel filter tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              channelFilter === 'all' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Todos os Canais
          </button>
          <button
            onClick={() => setChannelFilter('whatsapp')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              channelFilter === 'whatsapp' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setChannelFilter('instagram')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              channelFilter === 'instagram' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Instagram
          </button>
        </div>
      </div>

      {/* Main Inbox Layout (3 Panels: List, Chat, Customer Details) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[650px]">
        {/* Left Col: Conversation List (3.5 / 12) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-neutral-100 overflow-y-auto flex-1 text-xs">
            {filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-rose-50/60 border-l-4 border-rose-600' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900">{conv.customerName}</span>
                      {conv.channel === 'whatsapp' ? (
                        <span className="text-[10px] text-emerald-600 font-bold">WA</span>
                      ) : (
                        <span className="text-[10px] text-pink-600 font-bold">IG</span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 line-clamp-1">{lastMsg?.text || 'Sem mensagens'}</p>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        conv.status === 'active_ai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : conv.status === 'waiting_human'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {conv.status === 'active_ai' && '🤖 IA Atendendo'}
                      {conv.status === 'waiting_human' && '⚠️ Requer Humano'}
                      {conv.status === 'human_takeover' && '👤 Humano no Chat'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Col: Chat Conversation & Controls (5.5 / 12) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Top Chat Bar */}
          <div className="p-3.5 border-b border-neutral-200/80 bg-neutral-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                {selectedConv?.customerName.charAt(0) || 'C'}
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">{selectedConv?.customerName}</div>
                <div className="text-[10px] text-neutral-500">{selectedConv?.customerPhone}</div>
              </div>
            </div>

            {/* Takeover Control Toggle Button */}
            <button
              onClick={handleToggleTakeover}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 ${
                selectedConv?.status === 'human_takeover'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-neutral-900 text-white hover:bg-black'
              }`}
            >
              {selectedConv?.status === 'human_takeover' ? (
                <>
                  <Bot className="w-3.5 h-3.5" /> Devolver para IA Yafit
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" /> Assumir Conversa
                </>
              )}
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/30 text-xs">
            {selectedConv?.messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      isUser
                        ? 'bg-white border border-neutral-200 text-neutral-900 rounded-tl-none'
                        : 'bg-neutral-900 text-white rounded-tr-none'
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className="text-[9px] text-neutral-400 mt-1 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendHumanMessage} className="p-3 border-t border-neutral-100 flex gap-2">
            <input
              type="text"
              placeholder="Digite sua resposta como atendente humano..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Col: Quick Customer Card (3 / 12) */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-4 space-y-4 overflow-y-auto">
          <div className="text-center border-b border-neutral-100 pb-3">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-lg mx-auto mb-2">
              {selectedConv?.customerName.charAt(0)}
            </div>
            <h3 className="text-xs font-bold text-neutral-900">{selectedConv?.customerName}</h3>
            <div className="text-[11px] text-neutral-500">{selectedConv?.customerPhone}</div>
          </div>

          {customer && (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Gasto (LTV):</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    R$ {customer.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Cashback Saldo:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    R$ {customer.cashbackBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Atendimentos:</span>
                  <span className="font-bold text-neutral-900">{customer.appointmentsCount}</span>
                </div>
              </div>

              {customer.preferences.length > 0 && (
                <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
                  <span className="font-bold text-neutral-800 block text-[11px] mb-1">Preferências:</span>
                  <span className="text-[11px] text-neutral-600">{customer.preferences[0].value}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
