import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Sparkles,
  Calendar,
  ShoppingBag,
  Building2,
  Bot,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Store,
  Database,
  RefreshCw,
  PlusCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewAppointment: () => void;
  onOpenQuickSale: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewAppointment,
  onOpenQuickSale,
  onNavigateToTab,
}) => {
  const {
    currentTenant,
    setCurrentTenantId,
    tenants,
    currentUser,
    setCurrentUser,
    users,
    units,
    isControlPlaneMode,
    setIsControlPlaneMode,
    resetToDefaultData,
    aiConfig,
  } = useDatabase();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner if in Master Admin Mode */}
      {isControlPlaneMode && (
        <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">YAFIT CONTROL PLANE (ADMIN MASTER)</span>
            <span className="text-slate-400">|</span>
            <span>Você está no painel de administração global do SaaS</span>
          </div>
          <button
            onClick={() => setIsControlPlaneMode(false)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-md transition-colors border border-slate-700"
          >
            Voltar para o Salão ({currentTenant.name})
          </button>
        </div>
      )}

      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Tenant Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${currentTenant.whiteLabelConfig.primaryColor}, ${currentTenant.whiteLabelConfig.secondaryColor})`,
              }}
            >
              {currentTenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-base tracking-tight leading-none">
                  {currentTenant.whiteLabelConfig.salonName || currentTenant.name}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
                  {currentTenant.planId.replace('plan-', '')}
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate max-w-[220px] sm:max-w-xs mt-0.5">
                {currentTenant.whiteLabelConfig.tagline}
              </p>
            </div>
          </div>

          {/* Tenant Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg transition-colors border border-neutral-200"
              title="Trocar Salão (Multi-Tenancy)"
            >
              <Store className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Trocar Salão</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {tenantDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Salões Cadastrados (Multi-Tenant)
                </div>
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentTenantId(t.id);
                      setTenantDropdownOpen(false);
                      setIsControlPlaneMode(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                      t.id === currentTenant.id ? 'bg-rose-50/50 text-rose-950 font-medium' : 'text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: t.whiteLabelConfig.primaryColor }}
                      />
                      <div>
                        <div className="text-xs font-medium">{t.name}</div>
                        <div className="text-[10px] text-neutral-500">{t.contactPhone}</div>
                      </div>
                    </div>
                    {t.id === currentTenant.id && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-semibold">
                        Ativo
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Actions */}
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all shadow-xs hover:opacity-95"
            style={{
              backgroundColor: currentTenant.whiteLabelConfig.primaryColor,
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+ Novo Agendamento</span>
            <span className="md:hidden">+ Agendar</span>
          </button>

          <button
            onClick={onOpenQuickSale}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">PDV Rápido</span>
          </button>

          <button
            onClick={() => onNavigateToTab('ai-agent')}
            className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-2 rounded-xl transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden lg:inline">{aiConfig.name} (IA WhatsApp)</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </button>

          {/* Control Plane Master Toggle */}
          <button
            onClick={() => setIsControlPlaneMode(!isControlPlaneMode)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors border ${
              isControlPlaneMode
                ? 'bg-slate-900 text-emerald-300 border-slate-700'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
            }`}
            title="Acessar painel do SaaS Owner (Admin Master)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden xl:inline">
              {isControlPlaneMode ? 'Modo Salão' : 'Control Plane (Master)'}
            </span>
          </button>

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-neutral-200"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-neutral-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-neutral-500 capitalize">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <div className="text-xs font-semibold text-neutral-900">{currentUser.name}</div>
                  <div className="text-[11px] text-neutral-500">{currentUser.email}</div>
                  <div className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                    Perfil: {currentUser.role}
                  </div>
                </div>

                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-neutral-400">
                  Trocar Usuário (Simular RBAC)
                </div>
                {users
                  .filter((u) => u.tenantId === currentTenant.id || u.role === 'super_admin')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 flex items-center justify-between text-neutral-700"
                    >
                      <span>{u.name}</span>
                      <span className="text-[10px] text-neutral-500 capitalize">{u.role}</span>
                    </button>
                  ))}

                <div className="border-t border-neutral-100 my-1" />
                <button
                  onClick={() => {
                    resetToDefaultData();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restaurar Dados Padrão (Demo)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
