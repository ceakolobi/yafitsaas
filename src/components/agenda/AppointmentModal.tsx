import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { X, Calendar, Clock, User, Scissors, MapPin, AlertCircle, Bot, Zap } from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime?: string;
  initialProfessionalId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialTime,
  initialProfessionalId,
}) => {
  const {
    currentTenant,
    customers,
    services,
    professionals,
    units,
    appointments,
    addAppointment,
    addCustomer,
  } = useDatabase();

  const todayStr = new Date().toISOString().split('T')[0];

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [professionalId, setProfessionalId] = useState(initialProfessionalId || professionals[0]?.id || '');
  const [unitId, setUnitId] = useState(units[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState(initialTime || '10:00');
  const [notes, setNotes] = useState('');
  const [isEncaixe, setIsEncaixe] = useState(false);
  const [source, setSource] = useState<Appointment['source']>('manual_reception');

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId);
  const duration = selectedService ? selectedService.durationMinutes : 60;

  // Check schedule conflict
  const fullDateTimeStr = `${scheduledDate}T${scheduledTime}:00`;
  const hasConflict = appointments.some(
    (a) =>
      a.status !== 'cancelled' &&
      a.status !== 'no_show' &&
      a.professionalId === professionalId &&
      a.scheduledAt.startsWith(`${scheduledDate}T${scheduledTime}`)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetCustomerId = customerId;

    if (isNewCustomer && newCustomerName.trim()) {
      const created = addCustomer({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || '(11) 99999-0000',
        email: '',
        origin: 'walk_in',
        active: true,
        preferences: [],
        consents: [{ type: 'lgpd_terms', accepted: true, acceptedAt: new Date().toISOString() }],
      });
      targetCustomerId = created.id;
    }

    addAppointment({
      customerId: targetCustomerId,
      serviceId,
      professionalId,
      unitId,
      scheduledAt: fullDateTimeStr,
      durationMinutes: duration,
      status: 'confirmed',
      notes: notes.trim() || undefined,
      source,
      isEncaixe,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div
          className="px-6 py-4 flex items-center justify-between text-white"
          style={{
            background: `linear-gradient(135deg, ${currentTenant.whiteLabelConfig.primaryColor}, ${currentTenant.whiteLabelConfig.secondaryColor})`,
          }}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-base font-bold">Novo Agendamento</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Selection or Quick Create */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" /> Cliente
              </label>
              <button
                type="button"
                onClick={() => setIsNewCustomer(!isNewCustomer)}
                className="text-[11px] font-semibold text-rose-600 hover:underline"
              >
                {isNewCustomer ? 'Selecionar cadastrado' : '+ Cadastrar novo cliente'}
              </button>
            </div>

            {isNewCustomer ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <input
                  type="text"
                  required
                  placeholder="Nome do Cliente *"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="text"
                  placeholder="WhatsApp (ex: 11999998888)"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            ) : (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.phone} (LTV: R$ {c.totalSpent.toFixed(0)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Service and Professional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-neutral-400" /> Serviço
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (R$ {s.price.toFixed(2)} - {s.durationMinutes}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Profissional</label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.specialties[0] || 'Geral'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time and Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Data
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" /> Horário
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Unidade
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conflict Warning */}
          {hasConflict && !isEncaixe && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Conflito de Horário Detectado:</span> Já existe outro agendamento para este profissional neste mesmo horário. Marque como <strong>"Encaixe"</strong> caso deseje sobrepor.
              </div>
            </div>
          )}

          {/* Channel and Encaixe toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isEncaixe}
                onChange={(e) => setIsEncaixe(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
              <span>Marcar como Encaixe de emergência</span>
            </label>

            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600"
            >
              <option value="manual_reception">Presencial / Balcão</option>
              <option value="whatsapp_yafit">WhatsApp (IA Yafit)</option>
              <option value="online_booking">Site / App</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Observações / Requisitos</label>
            <textarea
              rows={2}
              placeholder="Ex: Cliente prefere água com gás, quer corte com tesoura de desbaste, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all"
              style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
