import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  UserCheck,
  Plus,
  Star,
  DollarSign,
  Calendar,
  Clock,
  Scissors,
  Check,
  X,
  Target,
  Edit2,
  Phone,
  Mail,
} from 'lucide-react';
import { Professional, ProfessionalSchedule } from '../../types';

export const ProfessionalsView: React.FC = () => {
  const {
    currentTenant,
    professionals,
    addProfessional,
    updateProfessional,
    services,
    commissions,
  } = useDatabase();

  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialties, setSpecialties] = useState('Mechas, Corte');
  const [commissionPct, setCommissionPct] = useState(50);
  const [monthlyGoal, setMonthlyGoal] = useState(12000);

  const handleCreateProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const defaultSchedules: ProfessionalSchedule[] = [
      { dayOfWeek: 1, dayName: 'Segunda', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, dayName: 'Terça', isWorking: true, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 3, dayName: 'Quarta', isWorking: true, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 4, dayName: 'Quinta', isWorking: true, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 5, dayName: 'Sexta', isWorking: true, startTime: '09:00', endTime: '20:00' },
      { dayOfWeek: 6, dayName: 'Sábado', isWorking: true, startTime: '08:30', endTime: '19:00' },
      { dayOfWeek: 0, dayName: 'Domingo', isWorking: false, startTime: '09:00', endTime: '18:00' },
    ];

    addProfessional({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '(11) 98888-7777',
      specialties: specialties.split(',').map((s) => s.trim()),
      serviceIds: services.map((s) => s.id),
      defaultCommissionPercentage: commissionPct,
      monthlyGoalRevenue: monthlyGoal,
      schedules: defaultSchedules,
      active: true,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
    });

    setIsNewModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Equipe & Profissionais</h1>
            <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              {professionals.length} especialistas
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gestão de escalas semanais, horários de intervalo, regras de comissão e acompanhamento de metas.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-xs"
          style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Cadastrar Profissional</span>
        </button>
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {professionals.map((prof) => {
          const profCommissions = commissions.filter((c) => c.professionalId === prof.id);
          const accumulatedCommission = profCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

          return (
            <div
              key={prof.id}
              className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={prof.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-rose-100 shadow-2xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">{prof.name}</h3>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {prof.ratingAverage.toFixed(2)}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span>{prof.reviewsCount} reviews</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ativo
                  </span>
                </div>

                {/* Specialties tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {prof.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Financial & Goal Card */}
                <div className="mt-4 grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-medium">Comissão Padrão</span>
                    <span className="text-xs font-bold text-neutral-900">
                      {prof.defaultCommissionPercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-medium">Comissão Acumulada</span>
                    <span className="text-xs font-bold text-emerald-600">
                      R$ {accumulatedCommission.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Weekly Schedule Preview */}
                <div className="mt-3 space-y-1 text-[11px]">
                  <span className="font-bold text-neutral-700 block">Dias de Trabalho na Semana:</span>
                  <div className="flex gap-1">
                    {prof.schedules.map((sch) => (
                      <span
                        key={sch.dayOfWeek}
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                          sch.isWorking ? 'bg-rose-100 text-rose-800' : 'bg-neutral-100 text-neutral-400'
                        }`}
                        title={`${sch.dayName}: ${sch.isWorking ? `${sch.startTime} - ${sch.endTime}` : 'Folga'}`}
                      >
                        {sch.dayName.charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfessional(prof)}
                className="w-full py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-colors text-center"
              >
                Gerenciar Escala & Extrato
              </button>
            </div>
          );
        })}
      </div>

      {/* Professional Detail Modal (Escala & Comissões) */}
      {selectedProfessional && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfessional.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedProfessional.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{selectedProfessional.name}</h3>
                  <div className="text-xs text-neutral-500">Escala de Trabalho & Comissões</div>
                </div>
              </div>
              <button onClick={() => setSelectedProfessional(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase">Horários Semanais Cadastrados</h4>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden text-xs">
                {selectedProfessional.schedules.map((sch) => (
                  <div key={sch.dayOfWeek} className="p-2.5 flex items-center justify-between hover:bg-neutral-50">
                    <span className="font-semibold text-neutral-800 w-24">{sch.dayName}</span>
                    <div className="flex items-center gap-2">
                      {sch.isWorking ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                          {sch.startTime} às {sch.endTime} (Intervalo: {sch.breakStartTime || '12:00'} - {sch.breakEndTime || '13:00'})
                        </span>
                      ) : (
                        <span className="text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                          Folga semanal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProfessional(null)}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs"
                style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
              >
                Salvar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Professional Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" /> Cadastrar Especialista
              </h3>
              <button onClick={() => setIsNewModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProfessional} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Oliveira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Comissão Padrão (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(parseFloat(e.target.value) || 40)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Especialidades (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Mechas, Cortes Modernos, Visagismo"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Meta Mensal de Faturamento (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(parseFloat(e.target.value) || 10000)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
                >
                  Salvar Profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
