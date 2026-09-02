import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { WhatsAppSettings } from './WhatsAppSettings';
import { Settings, Paintbrush, Clock, CheckCircle2, Save, Building } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentTenant, updateTenantWhiteLabel, units } = useDatabase();

  const [salonName, setSalonName] = useState(currentTenant.name);
  const [primaryColor, setPrimaryColor] = useState(currentTenant.whiteLabelConfig.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(currentTenant.whiteLabelConfig.secondaryColor);
  const [logoUrl, setLogoUrl] = useState(currentTenant.whiteLabelConfig.logoUrl);
  const [currencySymbol, setCurrencySymbol] = useState(currentTenant.whiteLabelConfig.currencySymbol);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toleranceMinutes, setToleranceMinutes] = useState(15);
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState(4);
  const [requireDepositForHighValue, setRequireDepositForHighValue] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantWhiteLabel({ primaryColor, secondaryColor, logoUrl, currencySymbol });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-800" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Configuracoes do Salao & White-Label</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">Personalize a identidade visual, cores, regras e atendimento WhatsApp.</p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
            <CheckCircle2 className="w-4 h-4" /> Alteracoes salvas com sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* White-Label */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Paintbrush className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-neutral-900">Identidade Visual (White-Label)</h3>
          </div>
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Nome Fantasia do Salao / Barbearia</label>
            <input type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Cor Primaria</label>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-9 h-9 rounded-lg border border-neutral-300 cursor-pointer p-0.5" />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 font-mono" />
              </div>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Cor Secundaria</label>
              <div className="flex items-center gap-2">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-9 h-9 rounded-lg border border-neutral-300 cursor-pointer p-0.5" />
                <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 font-mono" />
              </div>
            </div>
          </div>
          <div>
            <label className="font-bold text-neutral-700 block mb-1">URL do Logotipo</label>
            <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-neutral-300" />
          </div>
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Simbolo Monetario</label>
            <input type="text" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} className="w-24 px-3 py-2 rounded-xl border border-neutral-300 font-bold" />
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Previa do Tema:</span>
            <button type="button" className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs" style={{ backgroundColor: primaryColor }}>Exemplo de Acao Primaria</button>
          </div>
        </div>

        {/* Politicas */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Clock className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900">Politicas de Horarios & Cancelamentos</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Tolerancia de Atraso (Minutos):</label>
              <input type="number" min="5" max="30" value={toleranceMinutes} onChange={(e) => setToleranceMinutes(parseInt(e.target.value) || 15)} className="w-full px-3 py-2 rounded-xl border border-neutral-300" />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Antecedencia Minima para Cancelamento sem Taxa (Horas):</label>
              <input type="number" min="1" max="48" value={cancellationNoticeHours} onChange={(e) => setCancellationNoticeHours(parseInt(e.target.value) || 4)} className="w-full px-3 py-2 rounded-xl border border-neutral-300" />
            </div>
            <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer pt-2">
              <input type="checkbox" checked={requireDepositForHighValue} onChange={(e) => setRequireDepositForHighValue(e.target.checked)} className="w-4 h-4 text-rose-600 rounded" />
              <span>Exigir Sinal de 30% via Pix para procedimentos acima de R$ 250</span>
            </label>
          </div>
          <div className="pt-3 border-t border-neutral-100">
            <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-neutral-600" /> Unidades do Salao ({units.length})
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
          <button type="submit" className="w-full py-3 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
            <Save className="w-4 h-4" /> Salvar Configuracoes
          </button>
        </div>
      </form>

      {/* WhatsApp + Dica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhatsAppSettings tenantId={currentTenant.id} primaryColor={primaryColor} />
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-green-200/60 pb-3">
            <span className="text-lg">🤖</span>
            <h3 className="text-sm font-bold text-green-900">Como a Yafit IA atende</h3>
          </div>
          <div className="space-y-2 text-xs text-green-800">
            <p>Apos conectar o WhatsApp, a Yafit responde automaticamente com IA:</p>
            <div className="space-y-1.5 pl-2">
              <p>✅ Responde duvidas sobre servicos e precos</p>
              <p>✅ Consulta e sugere horarios disponiveis</p>
              <p>✅ Realiza agendamentos diretamente</p>
              <p>✅ Identifica e cadastra novos clientes</p>
              <p>✅ Envia confirmacoes de agendamento</p>
              <p>✅ Tom personalizado para o seu salao</p>
            </div>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-green-200 text-[10px] text-green-700">
            Dica: Adicione o numero conectado como contato salvo dos seus clientes com o nome do salao para uma experiencia mais profissional.
          </div>
        </div>
      </div>
    </div>
  );
};
