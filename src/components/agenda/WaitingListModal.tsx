import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { X, Clock, User, Phone, Plus, Check } from 'lucide-react';

interface WaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitingListModal: React.FC<WaitingListModalProps> = ({ isOpen, onClose }) => {
  const { currentTenant, waitingList, addWaitingListItem, services, professionals, customers } = useDatabase();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [professionalId, setProfessionalId] = useState('');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredPeriod, setPreferredPeriod] = useState<'morning' | 'afternoon' | 'night' | 'any'>('any');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    addWaitingListItem({
      customerId: 'cust-wait',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '(11) 99999-9999',
      serviceId,
      preferredProfessionalId: professionalId || undefined,
      preferredDate,
      preferredPeriod,
      notes: notes.trim() || undefined,
    });

    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold">Lista de Espera & Encaixes Rápidos</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Add Form */}
          <form onSubmit={handleAdd} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
            <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-rose-600" /> Adicionar Cliente na Fila de Espera
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                placeholder="Nome do Cliente *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              />
              <input
                type="text"
                placeholder="Telefone / WhatsApp"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                <option value="">Qualquer Profissional</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={preferredPeriod}
                onChange={(e) => setPreferredPeriod(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                <option value="any">Qualquer Período</option>
                <option value="morning">Manhã (08h - 12h)</option>
                <option value="afternoon">Tarde (13h - 18h)</option>
                <option value="night">Noite (18h - 21h)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all"
              style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
            >
              + Inserir na Fila de Espera
            </button>
          </form>

          {/* Current Waiting List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Clientes Aguardando Vaga ({waitingList.length})
            </h3>

            {waitingList.length === 0 ? (
              <div className="text-center py-6 text-neutral-400 text-xs">
                Nenhum cliente aguardando na lista de espera no momento.
              </div>
            ) : (
              <div className="space-y-2">
                {waitingList.map((item) => {
                  const srv = services.find((s) => s.id === item.serviceId);
                  const prof = professionals.find((p) => p.id === item.preferredProfessionalId);

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">{item.customerName}</span>
                          <span className="text-[10px] text-neutral-500">{item.customerPhone}</span>
                          <span className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-medium capitalize">
                            Período: {item.preferredPeriod}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-0.5">
                          <span>{srv?.name || 'Serviço'}</span>
                          {prof && <span className="text-neutral-400"> (Pref: {prof.name})</span>}
                          {item.notes && <span className="text-neutral-500 italic block mt-0.5">Obs: {item.notes}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Aguardando Encaixe
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
