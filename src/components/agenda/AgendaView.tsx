import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bot,
  Scissors,
  Check,
  X,
  AlertCircle,
  ListOrdered,
  Search,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { AppointmentModal } from './AppointmentModal';
import { WaitingListModal } from './WaitingListModal';
import { AppointmentStatus } from '../../types';

interface AgendaViewProps {
  onOpenQuickSale: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onOpenQuickSale }) => {
  const {
    currentTenant,
    appointments,
    updateAppointmentStatus,
    customers,
    services,
    professionals,
    units,
    waitingList,
  } = useDatabase();

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'professional'>('day');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isWaitingListOpen, setIsWaitingListOpen] = useState(false);
  const [slotPrefillTime, setSlotPrefillTime] = useState<string>('10:00');
  const [cancelModalAppointmentId, setCancelModalAppointmentId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFee, setCancelFee] = useState(0);

  // Time grid hours
  const hours = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
  ];

  // Filtered appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = apt.scheduledAt.startsWith(selectedDate);
    const matchesProf = selectedProfessionalId === 'all' || apt.professionalId === selectedProfessionalId;
    const matchesUnit = selectedUnitId === 'all' || apt.unitId === selectedUnitId;
    const customer = customers.find((c) => c.id === apt.customerId);
    const matchesSearch =
      !searchTerm ||
      (customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (customer?.phone.includes(searchTerm) ?? false);

    return matchesDate && matchesProf && matchesUnit && matchesSearch;
  });

  const handleSlotClick = (time: string, profId?: string) => {
    setSlotPrefillTime(time);
    setIsNewModalOpen(true);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cancelModalAppointmentId) {
      updateAppointmentStatus(cancelModalAppointmentId, 'cancelled', cancelReason, cancelFee);
      setCancelModalAppointmentId(null);
      setCancelReason('');
      setCancelFee(0);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Agenda Inteligente</h1>
            <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-200">
              {filteredAppointments.length} agendados
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gestão visual de horários, confirmações automáticas por WhatsApp e prevenção de conflitos.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Waiting List Button */}
          <button
            onClick={() => setIsWaitingListOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
            <span>Lista de Espera ({waitingList.length})</span>
          </button>

          {/* New Appointment Button */}
          <button
            onClick={() => {
              setSlotPrefillTime('10:00');
              setIsNewModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-xs"
            style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Filter and Date Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-xs font-medium text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-200"
          >
            Hoje
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-rose-500 w-40 sm:w-48"
            />
          </div>

          {/* Professional Filter */}
          <select
            value={selectedProfessionalId}
            onChange={(e) => setSelectedProfessionalId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:outline-none font-medium"
          >
            <option value="all">Todos os Profissionais</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Unit Filter */}
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:outline-none font-medium"
          >
            <option value="all">Todas as Unidades</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* View Mode Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-medium">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('professional')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'professional' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
              }`}
            >
              Por Profissional
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {viewMode === 'day' ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {hours.map((timeSlot) => {
              const currentSlotApts = filteredAppointments.filter((a) => {
                const aptTime = a.scheduledAt.includes('T') ? a.scheduledAt.split('T')[1].slice(0, 5) : '';
                return aptTime === timeSlot;
              });

              return (
                <div
                  key={timeSlot}
                  className="p-3 sm:p-4 hover:bg-neutral-50/50 transition-colors flex items-start gap-4 group"
                >
                  <div className="w-16 shrink-0 pt-1">
                    <span className="text-xs font-mono font-bold text-neutral-700">{timeSlot}</span>
                  </div>

                  <div className="flex-1 min-h-[44px]">
                    {currentSlotApts.length === 0 ? (
                      <button
                        onClick={() => handleSlotClick(timeSlot)}
                        className="w-full text-left py-2 px-3 rounded-xl border border-dashed border-neutral-200 text-neutral-400 text-xs hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/30 transition-all opacity-0 group-hover:opacity-100"
                      >
                        + Horário Livre (Clique para agendar)
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {currentSlotApts.map((apt) => {
                          const cust = customers.find((c) => c.id === apt.customerId);
                          const srv = services.find((s) => s.id === apt.serviceId);
                          const prof = professionals.find((p) => p.id === apt.professionalId);

                          return (
                            <div
                              key={apt.id}
                              className={`p-3.5 rounded-xl border transition-all ${
                                apt.status === 'confirmed'
                                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                  : apt.status === 'in_progress'
                                  ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-xs'
                                  : apt.status === 'completed'
                                  ? 'bg-neutral-100 border-neutral-300 text-neutral-700 opacity-80'
                                  : apt.status === 'cancelled'
                                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                                  : 'bg-amber-50/60 border-amber-200 text-amber-950'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs truncate">{cust?.name || 'Cliente'}</span>
                                <div className="flex items-center gap-1">
                                  {apt.source === 'whatsapp_yafit' && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-semibold flex items-center gap-0.5">
                                      <Bot className="w-2.5 h-2.5" /> IA
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-white/80 border border-neutral-200">
                                    {apt.status}
                                  </span>
                                </div>
                              </div>

                              <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                                <Scissors className="w-3 h-3" /> {srv?.name}
                              </div>

                              <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center justify-between">
                                <span>Prof: {prof?.name}</span>
                                <span className="font-mono">R$ {srv?.price.toFixed(2)}</span>
                              </div>

                              {apt.notes && (
                                <div className="mt-1.5 text-[10px] text-neutral-500 italic truncate">
                                  "{apt.notes}"
                                </div>
                              )}

                              {/* Action controls */}
                              <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between gap-1 text-[11px]">
                                <div className="flex items-center gap-1">
                                  {apt.status === 'scheduled' && (
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                      className="px-2 py-0.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors"
                                    >
                                      Confirmar
                                    </button>
                                  )}

                                  {apt.status === 'confirmed' && (
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                                      className="px-2 py-0.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
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
                                      className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                                    >
                                      Concluir & PDV
                                    </button>
                                  )}
                                </div>

                                {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                  <button
                                    onClick={() => setCancelModalAppointmentId(apt.id)}
                                    className="text-neutral-400 hover:text-rose-600 text-[10px] underline"
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Professional Columns View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((prof) => {
            const profApts = filteredAppointments.filter((a) => a.professionalId === prof.id);

            return (
              <div key={prof.id} className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col">
                <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={prof.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <div className="text-xs font-bold">{prof.name}</div>
                      <div className="text-[10px] text-neutral-400">{prof.specialties.join(', ')}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-neutral-800 text-rose-400 px-2 py-0.5 rounded-md">
                    {profApts.length} atend.
                  </span>
                </div>

                <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[500px]">
                  {profApts.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-xs">
                      Nenhum agendamento para este profissional hoje.
                      <button
                        onClick={() => {
                          setSlotPrefillTime('10:00');
                          setIsNewModalOpen(true);
                        }}
                        className="block mx-auto mt-2 text-rose-600 font-bold hover:underline"
                      >
                        + Agendar Horário
                      </button>
                    </div>
                  ) : (
                    profApts.map((apt) => {
                      const cust = customers.find((c) => c.id === apt.customerId);
                      const srv = services.find((s) => s.id === apt.serviceId);
                      const timeStr = apt.scheduledAt.split('T')[1]?.slice(0, 5) || '10:00';

                      return (
                        <div
                          key={apt.id}
                          className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-neutral-900">{timeStr}</span>
                            <span className="text-[10px] uppercase font-bold text-neutral-500 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                              {apt.status}
                            </span>
                          </div>
                          <div className="font-bold text-neutral-900">{cust?.name}</div>
                          <div className="text-rose-700 font-medium">{srv?.name}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Creation Modal */}
      <AppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        initialTime={slotPrefillTime}
        initialProfessionalId={selectedProfessionalId !== 'all' ? selectedProfessionalId : undefined}
      />

      {/* Waiting List Modal */}
      <WaitingListModal isOpen={isWaitingListOpen} onClose={() => setIsWaitingListOpen(false)} />

      {/* Cancellation Modal */}
      {cancelModalAppointmentId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> Cancelar Agendamento
            </h3>
            <p className="text-xs text-neutral-500">
              Informe o motivo do cancelamento e registre se haverá taxa cobrada de acordo com as regras do salão.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Motivo do Cancelamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cliente solicitou reagendamento por imprevisto"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Taxa de Cancelamento (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cancelFee}
                  onChange={(e) => setCancelFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalAppointmentId(null)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg shadow-xs hover:bg-rose-700"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
