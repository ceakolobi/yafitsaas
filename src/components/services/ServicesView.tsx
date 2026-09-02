import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Scissors,
  Plus,
  Clock,
  DollarSign,
  Percent,
  Sparkles,
  Layers,
  Edit2,
  Check,
  X,
  Package,
} from 'lucide-react';
import { Service, Combo } from '../../types';

export const ServicesView: React.FC = () => {
  const { currentTenant, services, categories, combos, addService, updateService, addCombo } = useDatabase();

  const [activeTab, setActiveTab] = useState<'services' | 'combos'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Service Modal
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(150);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [commissionValue, setCommissionValue] = useState(50);
  const [requiredResources, setRequiredResources] = useState('');

  // New Combo Modal
  const [isNewComboModalOpen, setIsNewComboModalOpen] = useState(false);
  const [comboName, setComboName] = useState('');
  const [comboDesc, setComboDesc] = useState('');
  const [comboDiscount, setComboDiscount] = useState(15);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const filteredServices = services.filter((s) => {
    return selectedCategory === 'all' || s.categoryId === selectedCategory;
  });

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addService({
      name: name.trim(),
      categoryId,
      description: description.trim(),
      price,
      durationMinutes,
      commissionType,
      commissionValue,
      requiredResources: requiredResources ? requiredResources.split(',').map((r) => r.trim()) : [],
      active: true,
    });

    setIsNewServiceModalOpen(false);
    setName('');
    setDescription('');
    setPrice(150);
  };

  const handleCreateCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboName.trim() || selectedServiceIds.length === 0) return;

    const originalPrice = selectedServiceIds.reduce((sum, id) => {
      const s = services.find((srv) => srv.id === id);
      return sum + (s?.price || 0);
    }, 0);

    const discountedPrice = originalPrice * (1 - comboDiscount / 100);

    addCombo({
      name: comboName.trim(),
      description: comboDesc.trim(),
      price: discountedPrice,
      originalPrice,
      discountPercentage: comboDiscount,
      serviceIds: selectedServiceIds,
      active: true,
    });

    setIsNewComboModalOpen(false);
    setComboName('');
    setComboDesc('');
    setSelectedServiceIds([]);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Serviços, Procedimentos & Combos</h1>
            <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              {services.length} serviços
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tabela de preços, comissionamento automático de profissionais e pacotes promocionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewComboModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Novo Combo</span>
          </button>

          <button
            onClick={() => setIsNewServiceModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-xs"
            style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Novo Serviço</span>
          </button>
        </div>
      </div>

      {/* Tabs & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'services' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Serviços Individuais ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('combos')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'combos' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-600'
            }`}
          >
            Combos & Promoções ({combos.length})
          </button>
        </div>

        {activeTab === 'services' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 font-medium"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Services Content */}
      {activeTab === 'services' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((srv) => {
            const category = categories.find((c) => c.id === srv.categoryId);
            return (
              <div
                key={srv.id}
                className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                      {category?.name || 'Geral'}
                    </span>
                    <span className="text-sm font-extrabold text-neutral-900 font-mono">
                      {currentTenant.whiteLabelConfig.currencySymbol} {srv.price.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 mt-2">{srv.name}</h3>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{srv.description}</p>
                </div>

                <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1 text-neutral-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{srv.durationMinutes} minutos</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                    <Percent className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      Comissão: {srv.commissionValue}
                      {srv.commissionType === 'percentage' ? '%' : ' R$'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Combos Content */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs bg-gradient-to-br from-white via-white to-purple-50/30 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                    {combo.discountPercentage}% OFF
                  </span>
                  <div className="text-right">
                    <span className="text-xs line-through text-neutral-400 mr-2">
                      R$ {combo.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-base font-extrabold text-purple-950">
                      R$ {combo.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 mt-2">{combo.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">{combo.description}</p>

                {/* Included Services */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Serviços Inclusos:
                  </span>
                  <div className="space-y-1">
                    {combo.serviceIds.map((sid) => {
                      const s = services.find((srv) => srv.id === sid);
                      return (
                        <div key={sid} className="text-xs text-neutral-700 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{s?.name || sid}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Service Modal */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" /> Adicionar Novo Serviço
              </h3>
              <button onClick={() => setIsNewServiceModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tonalização + Hidratação Flash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Categoria</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Comissão do Profissional (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(parseFloat(e.target.value) || 40)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes do que está incluso neste serviço..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: currentTenant.whiteLabelConfig.primaryColor }}
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Combo Modal */}
      {isNewComboModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> Criar Combo Promocional
              </h3>
              <button onClick={() => setIsNewComboModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCombo} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nome do Pacote / Combo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Combo Day Spa Renove"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Desconto (%)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={comboDiscount}
                  onChange={(e) => setComboDiscount(parseFloat(e.target.value) || 10)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Selecione os Serviços Inclusos:</label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-neutral-200 p-2 rounded-xl">
                  {services.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServiceIds([...selectedServiceIds, s.id]);
                          } else {
                            setSelectedServiceIds(selectedServiceIds.filter((id) => id !== s.id));
                          }
                        }}
                        className="rounded text-purple-600"
                      />
                      <span className="font-medium text-neutral-800">{s.name} (R$ {s.price})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewComboModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white rounded-xl shadow-xs bg-purple-600 hover:bg-purple-700"
                >
                  Salvar Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
