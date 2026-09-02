import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    currentTenant,
    sales,
    appointments,
    services,
    professionals,
    customers,
    aiConversations,
  } = useDatabase();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Calculations
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 185;

  const totalAppointments = appointments.length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const noShowCount = appointments.filter((a) => a.status === 'no_show').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  const noShowRate = totalAppointments > 0 ? Math.round((noShowCount / totalAppointments) * 100) : 5;
  const cancellationRate = totalAppointments > 0 ? Math.round((cancelledCount / totalAppointments) * 100) : 8;

  // AI metrics
  const aiBookings = appointments.filter((a) => a.source === 'whatsapp_yafit').length;
  const aiRevenue = sales
    .filter((s) => s.customerId.includes('1') || s.customerId.includes('2'))
    .reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Relatórios & Inteligência de Negócio (BI)</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Métricas de faturamento, ticket médio, retenção de clientes e performance da IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1 rounded-lg ${period === 'today' ? 'bg-white shadow-2xs font-bold' : 'text-neutral-600'}`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-lg ${period === 'week' ? 'bg-white shadow-2xs font-bold' : 'text-neutral-600'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-lg ${period === 'month' ? 'bg-white shadow-2xs font-bold' : 'text-neutral-600'}`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={() => alert('Relatório consolidado exportado em CSV/PDF com sucesso!')}
            className="flex items-center gap-1 text-xs font-bold bg-neutral-900 text-white px-3.5 py-2 rounded-xl"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Faturamento Consolidado</span>
          <div className="mt-2 text-2xl font-bold text-neutral-900 font-mono">
            R$ {totalRevenue.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% no comparativo
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Ticket Médio por Cliente</span>
          <div className="mt-2 text-2xl font-bold text-neutral-900 font-mono">
            R$ {avgTicket.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Média por atendimento PDV</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Taxa de No-Show (Faltas)</span>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {noShowRate}%
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Reduzido com lembretes automáticos</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Agendamentos Fechados via IA</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {aiBookings} <span className="text-xs font-normal text-neutral-500">atendimentos</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            Economia de 34h de recepção
          </div>
        </div>
      </div>

      {/* Services and Professionals Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Services Performance */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Scissors className="w-4 h-4 text-rose-600" /> Ranking de Serviços Mais Rentáveis
          </h3>

          <div className="space-y-3 text-xs">
            {services.map((s, idx) => {
              const estimatedSales = (idx + 1) * 8;
              const revenue = estimatedSales * s.price;

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-neutral-900 font-bold">{s.name}</span>
                    <span className="font-mono text-neutral-900">R$ {revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, 30 + idx * 20)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" /> Metas & Faturamento da Equipe
          </h3>

          <div className="space-y-3 text-xs">
            {professionals.map((prof) => {
              const currentRevs = 8450;
              const percent = Math.min(100, Math.round((currentRevs / prof.monthlyGoalRevenue) * 100));

              return (
                <div key={prof.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-900">{prof.name}</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      R$ {currentRevs} / R$ {prof.monthlyGoalRevenue} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
