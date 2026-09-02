import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Settings,
  Paintbrush,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Save,
  Globe,
  Building,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentTenant, updateTenantWhiteLabel, units } = useDatabase();

  const [salonName, setSalonName] = useState(currentTenant.name);
  const [primaryColor, setPrimaryColor] = useState(currentTenant.whiteLabelConfig.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(currentTenant.whiteLabelConfig.secondaryColor);
  const [logoUrl, setLogoUrl] = useState(currentTenant.whiteLabelConfig.logoUrl);
  const [currencySymbol, setCurrencySymbol] = useState(currentTenant.whiteLabelConfig.currencySymbol);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Salon rules
  const [toleranceMinutes, setToleranceMinutes] = useState(15);
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState(4);
  const [requireDepositForHighValue, setRequireDepositForHighValue] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantWhiteLabel({
      primaryColor,
      secondaryColor,
      logoUrl,
      currencySymbol,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-800" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Configurações do Salão & White-Label</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Personalize a identidade visual, cores, regras de cancelamento e unidades operacionais.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
            <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* White-Label Customization */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Paintbrush className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-neutral-900">Identidade Visual (White-Label)</h3>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Nome Fantasia do Salão / Barbearia</label>
            <input
              type="text"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Cor Primária do Tema</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Cor Secundária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">URL do Logotipo</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Símbolo Monetário</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-24 px-3 py-2 rounded-xl border border-neutral-300 font-bold"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Prévia do Botão e Tema:</span>
            <button
              type="button"
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              Exemplo de Ação Primária
            </button>
          </div>
        </div>

        {/* Salon Operating Rules & Multi-Unit */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Clock className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900">Políticas de Horários & Cancelamentos</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Tolerância de Atraso (Minutos):</label>
              <input
                type="number"
                min="5"
                max="30"
                value={toleranceMinutes}
                onChange={(e) => setToleranceMinutes(parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Antecedência Mínima para Cancelamento sem Taxa (Horas):
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={cancellationNoticeHours}
                onChange={(e) => setCancellationNoticeHours(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300"
              />
            </div>

            <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={requireDepositForHighValue}
                onChange={(e) => setRequireDepositForHighValue(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span>Exigir Sinal de 30% via Pix para procedimentos acima de R$ 250</span>
            </label>
          </div>

          {/* Units */}
          <div className="pt-3 border-t border-neutral-100">
            <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-neutral-600" /> Unidades do Salão ({units.length})
            </h4>
            <div className="space-y-2">
              {units.map((u) => (
                <div key={u.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="font-bold text-neutral-900">{u.name}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{u.address}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
