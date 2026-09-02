import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { FinancialTransaction } from '../../types';

export const FinancialView: React.FC = () => {
  const {
    currentTenant,
    transactions,
    addTransaction,
    commissions,
    payCommission,
    professionals,
    sales,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'cash_flow' | 'commissions' | 'dre'>('cash_flow');
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);

  // Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Aluguel e Condomínio');
  const [txAmount, setTxAmount] = useState(500);
  const [txDesc, setTxDesc] = useState('');
  const [txDueDate, setTxDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const pendingExpenses = transactions
    .filter((t) => t.type === 'expense' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // DRE Calculations
  const grossRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCommissionsPaid = commissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalCommissionsPending = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const operationalExpenses = totalExpense;
  const netProfit = grossRevenue - totalCommissionsPaid - operationalExpenses;

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || txAmount <= 0) return;

    addTransaction({
      type: txType,
      category: txCategory,
      description: txDesc.trim(),
      amount: txAmount,
      dueDate: txDueDate,
      paidAt: new Date().toISOString(),
      status: 'paid',
      paymentMethod: 'pix',
    });

    setIsNewTxOpen(false);
    setTxDesc('');
    setTxAmount(500);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Gestão Financeira & Comissões</h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              Fluxo Ativo
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Fluxo de caixa, contas a pagar/receber, extrato de comissões da equipe e DRE gerencial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTxOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-xs"
            style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Lançar Movimentação</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Receitas Realizadas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
            R$ {totalIncome.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Entradas compensadas</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Despesas Pagas</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 font-mono">
            R$ {totalExpense.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Saídas operacionais</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Saldo Líquido em Caixa</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${netBalance >= 0 ? 'text-neutral-900' : 'text-rose-600'}`}>
            R$ {netBalance.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Disponibilidade atual</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Comissões a Pagar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono">
            R$ {totalCommissionsPending.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Repasses pendentes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-2">
        <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('cash_flow')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'cash_flow' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Fluxo de Caixa ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'commissions' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Extrato de Comissões ({commissions.length})
          </button>
          <button
            onClick={() => setActiveTab('dre')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'dre' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            DRE Gerencial
          </button>
        </div>
      </div>

      {/* Tab 1: Cash Flow */}
      {activeTab === 'cash_flow' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Lançamentos Financeiros
            </h3>
            <span className="text-xs text-neutral-400">
              {transactions.filter((t) => t.status === 'paid').length} pagos |{' '}
              {transactions.filter((t) => t.status === 'pending').length} pendentes
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{t.description}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                      <span className="bg-neutral-100 px-1.5 py-0.2 rounded">{t.category}</span>
                      <span>•</span>
                      <span>Vencimento: {new Date(t.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-sm ${
                      t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </span>
                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {t.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Commissions by Professional */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map((prof) => {
              const profCommissions = commissions.filter((c) => c.professionalId === prof.id);
              const pendingComm = profCommissions
                .filter((c) => c.status === 'pending')
                .reduce((sum, c) => sum + c.commissionAmount, 0);
              const paidComm = profCommissions
                .filter((c) => c.status === 'paid')
                .reduce((sum, c) => sum + c.commissionAmount, 0);

              return (
                <div key={prof.id} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={prof.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">{prof.name}</h4>
                        <span className="text-[10px] text-neutral-500">Taxa: {prof.defaultCommissionPercentage}%</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      Total: R$ {(pendingComm + paidComm).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-neutral-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Pendente de Repasse</span>
                      <span className="font-bold text-amber-600 font-mono">R$ {pendingComm.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Já Pago</span>
                      <span className="font-bold text-emerald-600 font-mono">R$ {paidComm.toFixed(2)}</span>
                    </div>
                  </div>

                  {profCommissions.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-neutral-100 max-h-40 overflow-y-auto text-[11px]">
                      {profCommissions.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-1.5 hover:bg-neutral-50 rounded">
                          <div>
                            <span className="font-medium text-neutral-800">{c.serviceName}</span>
                            <span className="text-[10px] text-neutral-400 block">
                              Base: R$ {c.servicePrice.toFixed(2)} ({c.commissionPercentage}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono">R$ {c.commissionAmount.toFixed(2)}</span>
                            {c.status === 'pending' ? (
                              <button
                                onClick={() => payCommission(c.id)}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                              >
                                Pagar
                              </button>
                            ) : (
                              <span className="text-emerald-600 text-[10px] font-bold">Pago</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: DRE */}
      {activeTab === 'dre' && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Demonstração do Resultado do Exercício (DRE)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Visão consolidada da rentabilidade do salão.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-bold text-sm text-neutral-900 p-2 bg-emerald-50/50 rounded-xl">
              <span>(+) RECEITA BRUTA OPERACIONAL</span>
              <span className="font-mono">R$ {grossRevenue.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-neutral-600 px-3">
              <span>(-) Deduções de Cupons e Descontos</span>
              <span className="font-mono text-rose-600">- R$ 120.00</span>
            </div>

            <div className="flex justify-between font-bold text-neutral-800 px-3 py-1 border-y border-neutral-100">
              <span>(=) RECEITA LÍQUIDA</span>
              <span className="font-mono">R$ {(grossRevenue - 120).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-neutral-600 px-3">
              <span>(-) Comissões dos Profissionais (Custos Diretos)</span>
              <span className="font-mono text-rose-600">- R$ {totalCommissionsPaid.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-neutral-600 px-3">
              <span>(-) Despesas Operacionais (Aluguel, Produtos, Insumos, Luz, Água)</span>
              <span className="font-mono text-rose-600">- R$ {operationalExpenses.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-extrabold text-base text-neutral-900 p-3 bg-neutral-900 text-white rounded-xl">
              <span>(=) RESULTADO LÍQUIDO / LUCRO OPERACIONAL</span>
              <span className="font-mono text-emerald-400">R$ {Math.max(0, netProfit).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {isNewTxOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" /> Nova Movimentação Financeira
              </h3>
              <button onClick={() => setIsNewTxOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 rounded-xl border font-bold ${
                    txType === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'border-neutral-200'
                  }`}
                >
                  Saída / Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 rounded-xl border font-bold ${
                    txType === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-neutral-200'
                  }`}
                >
                  Entrada / Receita
                </button>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento da Conta de Energia Elétrica"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Categoria</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  >
                    <option value="Aluguel e Condomínio">Aluguel e Condomínio</option>
                    <option value="Insumos e Produtos">Insumos e Produtos</option>
                    <option value="Energia e Água">Energia e Água</option>
                    <option value="Marketing e Tráfego">Marketing e Tráfego</option>
                    <option value="Internet e Telefonia">Internet e Telefonia</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Data de Vencimento / Pagamento</label>
                <input
                  type="date"
                  value={txDueDate}
                  onChange={(e) => setTxDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewTxOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
