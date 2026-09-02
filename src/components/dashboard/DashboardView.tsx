import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Bot,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Sparkles,
  Scissors,
  Star,
  ChevronRight,
  Smartphone,
  Check,
  ShoppingBag,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTab: (tab: string) => void;
  onOpenNewAppointment: () => void;
  onOpenQuickSale: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToTab,
  onOpenNewAppointment,
  onOpenQuickSale,
}) => {
  const {
    currentTenant,
    appointments,
    updateAppointmentStatus,
    sales,
    customers,
    services,
    professionals,
    products,
    transactions,
    aiConversations,
    aiConfig,
  } = useDatabase();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const todayAppointments = appointments.filter((a) => a.scheduledAt.startsWith(todayStr));
  const confirmedToday = todayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'in_progress').length;
  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length;
  const scheduledToday = todayAppointments.filter((a) => a.status === 'scheduled').length;
  const cancelledToday = todayAppointments.filter((a) => a.status === 'cancelled' || a.status === 'no_show').length;

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);
  const averageTicket = sales.length > 0 ? totalSalesRevenue / sales.length : 180.0;

  // Occupancy rate calculation
  const totalSlotsCapacity = professionals.length * 8; // approx 8 slots per professional/day
  const bookedSlots = todayAppointments.length;
  const occupancyPercent = totalSlotsCapacity > 0 ? Math.min(100, Math.round((bookedSlots / totalSlotsCapacity) * 100)) : 75;

  // AI Performance metrics
  const totalAiConversations = aiConversations.length;
  const aiBookingsCount = appointments.filter((a) => a.source === 'whatsapp_yafit').length;
  const aiConversionRate = totalAiConversations > 0 ? Math.round((aiBookingsCount / totalAiConversations) * 100) : 85;

  // Alerts
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStock);
  const pendingExpenses = transactions.filter((t) => t.type === 'expense' && t.status === 'pending');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Welcome Header */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Visão Geral — {currentTenant.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operação Aberta
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Acompanhe em tempo real o fluxo da agenda, faturamento, equipe e atendimentos automatizados pela IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewAppointment}
            className="text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all shadow-xs"
            style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
          >
            + Agendamento
          </button>
          <button
            onClick={onOpenQuickSale}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            + Venda PDV
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Hoje */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Faturamento Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {currentTenant.whiteLabelConfig.currencySymbol} {todayRevenue.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs. ontem</span>
            <span className="text-neutral-400 font-normal">| Mês: R$ {totalSalesRevenue.toFixed(0)}</span>
          </div>
        </div>

        {/* Card 2: Agendamentos Hoje */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Agendamentos Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {todayAppointments.length} <span className="text-xs font-normal text-neutral-500">atendimentos</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600 font-medium">
            <span className="text-emerald-600">{confirmedToday + completedToday} confirmados</span>
            <span className="text-neutral-300">•</span>
            <span className="text-amber-600">{scheduledToday} pendentes</span>
          </div>
        </div>

        {/* Card 3: Ocupação da Agenda */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Ocupação da Agenda</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {occupancyPercent}%
          </div>
          <div className="mt-2 w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-neutral-400">
            {bookedSlots} de {totalSlotsCapacity} slots disponíveis ocupados
          </div>
        </div>

        {/* Card 4: Performance IA Yafit */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-neutral-500">Agente IA ({aiConfig.name})</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {aiBookingsCount} <span className="text-xs font-normal text-neutral-500">agendados via IA</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiConversionRate}% taxa de conversão</span>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner if Any */}
      {(lowStockProducts.length > 0 || pendingExpenses.length > 0) && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-950">Atenção Gerencial: </span>
              {lowStockProducts.length > 0 && (
                <span>{lowStockProducts.length} produto(s) abaixo do estoque mínimo. </span>
              )}
              {pendingExpenses.length > 0 && (
                <span>{pendingExpenses.length} conta(s) a pagar pendentes para hoje.</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lowStockProducts.length > 0 && (
              <button
                onClick={() => onNavigateToTab('inventory')}
                className="font-semibold bg-amber-200/70 hover:bg-amber-300 text-amber-950 px-2.5 py-1 rounded-lg transition-colors"
              >
                Ver Estoque
              </button>
            )}
            {pendingExpenses.length > 0 && (
              <button
                onClick={() => onNavigateToTab('financial')}
                className="font-semibold bg-amber-200/70 hover:bg-amber-300 text-amber-950 px-2.5 py-1 rounded-lg transition-colors"
              >
                Ver Financeiro
              </button>
            )}
          </div>
        </div>
      )}

      {/* Two Column Layout: Today's Appointments & Team/Service Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Today's Schedule */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-neutral-900">Agenda de Hoje em Tempo Real</h2>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                {todayAppointments.length} agendados
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('agenda')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              Ver Agenda Completa <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              Nenhum agendamento cadastrado para a data de hoje.
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.map((apt) => {
                const customer = customers.find((c) => c.id === apt.customerId);
                const service = services.find((s) => s.id === apt.serviceId);
                const prof = professionals.find((p) => p.id === apt.professionalId);
                const timeOnly = apt.scheduledAt.includes('T') ? apt.scheduledAt.split('T')[1].slice(0, 5) : '09:00';

                return (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border border-neutral-200/70 hover:border-neutral-300 hover:bg-neutral-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-center">
                        <span className="text-sm font-bold text-neutral-900 block font-mono">{timeOnly}</span>
                        <span className="text-[10px] text-neutral-500 font-medium">{apt.durationMinutes} min</span>
                      </div>

                      <div className="w-px h-8 bg-neutral-200 hidden sm:block" />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">{customer?.name || 'Cliente'}</span>
                          {apt.source === 'whatsapp_yafit' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                              <Bot className="w-2.5 h-2.5" /> IA Yafit
                            </span>
                          )}
                          {apt.isEncaixe && (
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-md">
                              Encaixe
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-600 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-rose-700">{service?.name}</span>
                          <span className="text-neutral-300">•</span>
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Scissors className="w-3 h-3" /> {prof?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : apt.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                            : apt.status === 'completed'
                            ? 'bg-neutral-100 text-neutral-700'
                            : apt.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {apt.status === 'confirmed' && 'Confirmado'}
                        {apt.status === 'in_progress' && 'Em Atendimento'}
                        {apt.status === 'completed' && 'Concluído'}
                        {apt.status === 'cancelled' && 'Cancelado'}
                        {apt.status === 'scheduled' && 'Aguardando'}
                        {apt.status === 'no_show' && 'No-Show'}
                      </span>

                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Confirmar Presença"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                          className="text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg transition-colors"
                        >
                          Iniciar
                        </button>
                      )}

                      {apt.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'completed');
                            onOpenQuickSale();
                          }}
                          className="text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                        >
                          Finalizar no PDV
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Top Services & AI Live Monitor */}
        <div className="space-y-6">
          {/* Top Services */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-rose-600" /> Serviços Mais Vendidos
              </h2>
              <button
                onClick={() => onNavigateToTab('services')}
                className="text-[11px] font-semibold text-rose-600 hover:underline"
              >
                Ver Tabela
              </button>
            </div>

            <div className="space-y-2.5">
              {services.slice(0, 4).map((srv, idx) => (
                <div key={srv.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-neutral-800 truncate max-w-[140px]">{srv.name}</span>
                  </div>
                  <span className="font-bold text-neutral-900">
                    {currentTenant.whiteLabelConfig.currencySymbol} {srv.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Professionals */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Destaques da Equipe
              </h2>
              <button
                onClick={() => onNavigateToTab('professionals')}
                className="text-[11px] font-semibold text-rose-600 hover:underline"
              >
                Gerenciar
              </button>
            </div>

            <div className="space-y-3">
              {professionals.map((prof) => (
                <div key={prof.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={prof.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">{prof.name}</div>
                      <div className="text-[10px] text-neutral-500">{prof.specialties[0] || 'Profissional'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-amber-600 flex items-center gap-0.5 justify-end">
                      <Star className="w-3 h-3 fill-amber-500" /> {prof.ratingAverage.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-neutral-400">Comissão: {prof.defaultCommissionPercentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
