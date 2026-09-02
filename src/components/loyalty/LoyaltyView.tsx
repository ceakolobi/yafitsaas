import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Gift,
  Plus,
  Percent,
  Sparkles,
  Send,
  Users,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  X,
} from 'lucide-react';
import { Coupon } from '../../types';

export const LoyaltyView: React.FC = () => {
  const { currentTenant, coupons, addCoupon, customers } = useDatabase();

  const [activeSubTab, setActiveSubTab] = useState<'cashback' | 'coupons' | 'campaigns'>('cashback');

  // Cashback settings
  const [cashbackPercent, setCashbackPercent] = useState(5);
  const [pointsPerReal, setPointsPerReal] = useState(1);

  // New coupon modal
  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderValue, setMinOrderValue] = useState(100);
  const [validUntil, setValidUntil] = useState('2026-12-31');

  // Campaigns
  const [campaignSuccess, setCampaignSuccess] = useState<string | null>(null);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      validUntil,
      active: true,
      timesUsed: 0,
    });

    setIsNewCouponOpen(false);
    setCode('');
  };

  const handleRunCampaign = (campaignName: string, recipientCount: number) => {
    setCampaignSuccess(`Campanha "${campaignName}" disparada com sucesso para ${recipientCount} clientes via WhatsApp!`);
    setTimeout(() => setCampaignSuccess(null), 5000);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Fidelidade & Campanhas de Marketing</h1>
            <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              Retenção Ativa
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cashback automático pós-atendimento, cupons de primeira visita e automações de reativação de clientes.
          </p>
        </div>

        <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('cashback')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'cashback' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Cashback & Pontos
          </button>
          <button
            onClick={() => setActiveSubTab('coupons')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'coupons' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Cupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'campaigns' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Automações WhatsApp
          </button>
        </div>
      </div>

      {campaignSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{campaignSuccess}</span>
        </div>
      )}

      {/* Subtab 1: Cashback */}
      {activeSubTab === 'cashback' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-neutral-900">Configuração de Cashback do Salão</h3>
            </div>
            <p className="text-xs text-neutral-500">
              Clientes recebem uma porcentagem do valor gasto em cada atendimento para abater na próxima visita.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Porcentagem Padrão de Retorno (%):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={cashbackPercent}
                    onChange={(e) => setCashbackPercent(parseInt(e.target.value))}
                    className="flex-1 accent-rose-600"
                  />
                  <span className="font-bold text-base font-mono w-12 text-rose-600">{cashbackPercent}%</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Validade do Saldo de Cashback:</label>
                <select className="w-full px-3 py-2 rounded-xl border border-neutral-300">
                  <option value="60">60 dias após a emissão</option>
                  <option value="90">90 dias após a emissão</option>
                  <option value="180">180 dias após a emissão</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                ✨ Em um atendimento de R$ 200,00, a cliente ganha <strong>R$ {(200 * cashbackPercent) / 100},00</strong> de cashback creditado imediatamente.
              </div>

              <button
                onClick={() => alert('Configurações de Cashback salvas com sucesso!')}
                className="w-full py-2.5 font-bold text-white rounded-xl shadow-xs"
                style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
              >
                Salvar Regras de Cashback
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-neutral-900">Ranking de Clientes com Saldo</h3>
            </div>

            <div className="divide-y divide-neutral-100 text-xs">
              {customers.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900">{c.name}</span>
                    <span className="text-[10px] text-neutral-400 block">{c.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 font-mono">
                      R$ {c.cashbackBalance.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">{c.loyaltyPoints} pontos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Coupons */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsNewCouponOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-xs"
              style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Criar Cupom</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((cp) => (
              <div
                key={cp.id}
                className="bg-white p-5 rounded-2xl border border-dashed border-rose-300 shadow-xs space-y-3 bg-gradient-to-br from-white to-rose-50/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold text-rose-700 tracking-wider bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    {cp.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {cp.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="text-xs text-neutral-600">
                  Desconto de{' '}
                  <strong className="text-neutral-900">
                    {cp.discountValue}
                    {cp.discountType === 'percentage' ? '%' : ' R$'}
                  </strong>{' '}
                  em pedidos acima de R$ {cp.minOrderValue.toFixed(2)}.
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Usado {cp.timesUsed} vezes</span>
                  <span>Válido até {new Date(cp.validUntil).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Automated Marketing Campaigns */}
      {activeSubTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                Reativação
              </span>
              <h3 className="text-sm font-bold text-neutral-900 mt-2">Clientes Sumidos (+45 dias)</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Dispara mensagem amigável via IA Yafit oferecendo 15% OFF no retorno.
              </p>
            </div>
            <button
              onClick={() => handleRunCampaign('Reativação 45 dias', 18)}
              className="w-full py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Disparar para 18 Clientes
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                Aniversariantes
              </span>
              <h3 className="text-sm font-bold text-neutral-900 mt-2">Aniversariantes do Mês</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Envia presente de parabéns com voucher de hidratação cortesia em qualquer serviço.
              </p>
            </div>
            <button
              onClick={() => handleRunCampaign('Aniversariantes do Mês', 12)}
              className="w-full py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
            >
              <Send className="w-3.5 h-3.5" /> Disparar para 12 Aniversariantes
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Pós-Atendimento
              </span>
              <h3 className="text-sm font-bold text-neutral-900 mt-2">Pesquisa de Satisfação NPS</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Pergunta como foi o atendimento 2h após a finalização no caixa do salão.
              </p>
            </div>
            <button
              onClick={() => handleRunCampaign('NPS 2h Pós-Atendimento', 5)}
              className="w-full py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Disparar para Atendidos Hoje
            </button>
          </div>
        </div>
      )}

      {/* New Coupon Modal */}
      {isNewCouponOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-600" /> Criar Cupom Promocional
              </h3>
              <button onClick={() => setIsNewCouponOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VERÃO20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Tipo de Desconto</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Valor do Desconto</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Pedido Mínimo (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Validade</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewCouponOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
