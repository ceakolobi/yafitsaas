import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCheck,
  ShoppingBag,
  Package,
  Wallet,
  Bot,
  Gift,
  MessageSquare,
  BarChart3,
  Settings,
  Database,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentTenant, isControlPlaneMode, appointments, products, transactions, aiConversations } = useDatabase();

  // Counts for alert badges
  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'scheduled').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStock).length;
  const pendingBillsCount = transactions.filter((t) => t.type === 'expense' && t.status === 'pending').length;
  const waitingHumanAiCount = aiConversations.filter((c) => c.status === 'waiting_human').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'customers', label: 'Clientes (CRM)', icon: Users },
    { id: 'services', label: 'Serviços & Combos', icon: Scissors },
    { id: 'professionals', label: 'Profissionais', icon: UserCheck },
    { id: 'sales', label: 'Vendas & PDV', icon: ShoppingBag },
    {
      id: 'inventory',
      label: 'Estoque',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} baixo` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'financial',
      label: 'Financeiro',
      icon: Wallet,
      badge: pendingBillsCount > 0 ? `${pendingBillsCount} a pagar` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'ai-agent',
      label: 'Agente IA (Yafit)',
      icon: Bot,
      highlight: true,
      badge: 'Live',
      badgeColor: 'bg-emerald-500 text-white',
    },
    { id: 'loyalty', label: 'Fidelidade & Marketing', icon: Gift },
    {
      id: 'omnichannel',
      label: 'Atendimento Omnichannel',
      icon: MessageSquare,
      badge: waitingHumanAiCount > 0 ? `${waitingHumanAiCount} humano` : undefined,
      badgeColor: 'bg-blue-600 text-white',
    },
    { id: 'reports', label: 'Relatórios & BI', icon: BarChart3 },
    { id: 'settings', label: 'Configurações & White-label', icon: Settings },
    { id: 'supabase-sql', label: 'Supabase SQL & RLS', icon: Database },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-neutral-200 hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
          Módulos do Salão
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-rose-500'
                      : 'text-neutral-400 group-hover:text-neutral-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Tenant Info Card */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50/70">
        <div className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-neutral-800 truncate">
              {currentTenant.name}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sistema Online" />
          </div>
          <div className="text-[10px] text-neutral-500 flex items-center justify-between">
            <span>Plano {currentTenant.planId.replace('plan-', '').toUpperCase()}</span>
            <span className="font-mono font-medium text-neutral-700">RLS Ativo</span>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
            <span>Multi-Tenant DB</span>
            <span className="text-rose-600 font-semibold flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> IA Ativa
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
