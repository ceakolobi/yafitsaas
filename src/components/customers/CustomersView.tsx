import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Gift,
  ShieldCheck,
  Bot,
  Heart,
  Edit2,
  DollarSign,
  Clock,
  Sparkles,
  MessageCircle,
  X,
  FileText,
} from 'lucide-react';
import { Customer } from '../../types';

export const CustomersView: React.FC = () => {
  const {
    currentTenant,
    customers,
    addCustomer,
    updateCustomer,
    appointments,
    sales,
    services,
    aiConversations,
  } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState<'all' | 'vip' | 'birthday' | 'inactive'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newOrigin, setNewOrigin] = useState<Customer['origin']>('walk_in');

  // Filter logic
  const currentMonthStr = `-${String(new Date().getMonth() + 1).padStart(2, '0')}-`;

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.includes(searchTerm) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterSegment === 'vip') return cust.totalSpent > 2000;
    if (filterSegment === 'birthday') return cust.birthDate && cust.birthDate.includes(currentMonthStr);
    if (filterSegment === 'inactive') return cust.appointmentsCount > 0 && (!cust.lastVisitAt || new Date(cust.lastVisitAt).getTime() < Date.now() - 45 * 86400000);

    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addCustomer({
      name: newName.trim(),
      phone: newPhone.trim() || '(11) 99999-8888',
      email: newEmail.trim(),
      birthDate: newBirthDate || undefined,
      notes: newNotes.trim() || undefined,
      origin: newOrigin,
      active: true,
      preferences: [],
      consents: [
        { type: 'lgpd_terms', accepted: true, acceptedAt: new Date().toISOString() },
        { type: 'whatsapp_notifications', accepted: true, acceptedAt: new Date().toISOString() },
        { type: 'marketing_promotions', accepted: true, acceptedAt: new Date().toISOString() },
      ],
    });

    setIsNewModalOpen(false);
    setSelectedCustomer(created);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewBirthDate('');
    setNewNotes('');
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Gestão de Clientes (CRM & LGPD)</h1>
            <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              {customers.length} cadastrados
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Ficha 360°, histórico de procedimentos, LTV, preferências e conformidade LGPD registrada.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-xs self-start md:self-auto"
          style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Novo Cliente</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilterSegment('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterSegment === 'all' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Todos ({customers.length})
          </button>
          <button
            onClick={() => setFilterSegment('vip')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterSegment === 'vip' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            VIPs (LTV &gt; R$ 2k)
          </button>
          <button
            onClick={() => setFilterSegment('birthday')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterSegment === 'birthday' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Aniversariantes
          </button>
        </div>
      </div>

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const isVip = cust.totalSpent >= 2000;
          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="bg-white p-4 rounded-2xl border border-neutral-200/80 hover:border-neutral-300 shadow-xs hover:shadow-sm cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-sm">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 group-hover:text-rose-600 transition-colors">
                      {cust.name}
                    </h3>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-neutral-400" /> {cust.phone}
                    </div>
                  </div>
                </div>

                {isVip && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> VIP
                  </span>
                )}
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">LTV</span>
                  <span className="text-xs font-bold text-neutral-900">
                    R$ {cust.totalSpent.toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Visitas</span>
                  <span className="text-xs font-bold text-neutral-900">{cust.appointmentsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Cashback</span>
                  <span className="text-xs font-bold text-emerald-600">R$ {cust.cashbackBalance.toFixed(0)}</span>
                </div>
              </div>

              {/* Preferences Preview */}
              {cust.preferences && cust.preferences.length > 0 && (
                <div className="text-[11px] text-neutral-600 bg-rose-50/40 p-2 rounded-lg border border-rose-100/60 truncate">
                  <span className="font-semibold text-rose-900">Preferência: </span>
                  {cust.preferences[0].value}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>Origem: {cust.origin.replace('_', ' ')}</span>
                <span className="text-rose-600 font-semibold group-hover:underline">Ver Ficha 360° →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Detail Modal (Ficha 360° & LGPD) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div
              className="p-6 text-white flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${currentTenant.whiteLabelConfig.primaryColor}, ${currentTenant.whiteLabelConfig.secondaryColor})`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xl">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedCustomer.name}</h2>
                  <div className="text-xs text-rose-100 flex items-center gap-3 mt-0.5">
                    <span>{selectedCustomer.phone}</span>
                    {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Tabs */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block">LTV Total Gasto</span>
                  <span className="text-base font-bold text-neutral-900">
                    R$ {selectedCustomer.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block">Total de Atendimentos</span>
                  <span className="text-base font-bold text-neutral-900">
                    {selectedCustomer.appointmentsCount}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block">Pontos de Fidelidade</span>
                  <span className="text-base font-bold text-amber-600">
                    {selectedCustomer.loyaltyPoints} pts
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block">Saldo de Cashback</span>
                  <span className="text-base font-bold text-emerald-600">
                    R$ {selectedCustomer.cashbackBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Preferences and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100 space-y-2">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-600" /> Preferências do Cliente
                  </h4>
                  {selectedCustomer.preferences.length === 0 ? (
                    <p className="text-neutral-400">Nenhuma preferência personalizada cadastrada.</p>
                  ) : (
                    <div className="space-y-1">
                      {selectedCustomer.preferences.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-neutral-700">{p.key}:</span>
                          <span className="text-neutral-900">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-500" /> Observações da Recepção
                  </h4>
                  <p className="text-neutral-600">{selectedCustomer.notes || 'Sem observações cadastradas.'}</p>
                </div>
              </div>

              {/* LGPD Compliance Section */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Conformidade LGPD & Termos de Consentimento
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedCustomer.consents.map((c, i) => (
                    <div key={i} className="bg-white p-2.5 rounded-lg border border-emerald-100 text-[10px]">
                      <div className="font-bold text-emerald-900 uppercase">
                        {c.type === 'lgpd_terms' && 'Termos Gerais'}
                        {c.type === 'whatsapp_notifications' && 'Notificações WhatsApp'}
                        {c.type === 'marketing_promotions' && 'Marketing & Cupons'}
                      </div>
                      <div className="text-emerald-700 mt-0.5">
                        Aceito em: {new Date(c.acceptedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* History of Appointments & Sales */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" /> Histórico de Agendamentos & Vendas
                </h4>
                <div className="space-y-2">
                  {appointments
                    .filter((a) => a.customerId === selectedCustomer.id)
                    .map((apt) => {
                      const srv = services.find((s) => s.id === apt.serviceId);
                      return (
                        <div
                          key={apt.id}
                          className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-neutral-900">{srv?.name || 'Serviço'}</span>
                            <div className="text-neutral-500 text-[10px]">
                              Data: {new Date(apt.scheduledAt).toLocaleString('pt-BR')}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-white border border-neutral-200 uppercase">
                            {apt.status}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">ID: {selectedCustomer.id}</span>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs"
                style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" /> Cadastrar Novo Cliente
              </h3>
              <button onClick={() => setIsNewModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Nogueira"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 99999-8888"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Origem do Cadastro</label>
                <select
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                >
                  <option value="walk_in">Presencial / Balcão</option>
                  <option value="whatsapp_ai">WhatsApp (Yafit IA)</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Site do Salão</option>
                  <option value="indication">Indicação de Amigo</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Observações / Preferências</label>
                <textarea
                  rows={2}
                  placeholder="Preferências, alergias ou notas..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
