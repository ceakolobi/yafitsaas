import React, { useState } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AgendaView } from './components/agenda/AgendaView';
import { CustomersView } from './components/customers/CustomersView';
import { ServicesView } from './components/services/ServicesView';
import { ProfessionalsView } from './components/professionals/ProfessionalsView';
import { SalesView } from './components/sales/SalesView';
import { InventoryView } from './components/inventory/InventoryView';
import { FinancialView } from './components/financial/FinancialView';
import { AiAgentView } from './components/ai/AiAgentView';
import { LoyaltyView } from './components/loyalty/LoyaltyView';
import { OmnichannelInboxView } from './components/omnichannel/OmnichannelInboxView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { SupabaseSqlView } from './components/supabase/SupabaseSqlView';
import { AppointmentModal } from './components/agenda/AppointmentModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            onOpenQuickSale={() => setActiveTab('sales')}
          />
        );
      case 'agenda':
        return <AgendaView onOpenQuickSale={() => setActiveTab('sales')} />;
      case 'customers':
        return <CustomersView />;
      case 'services':
        return <ServicesView />;
      case 'professionals':
        return <ProfessionalsView />;
      case 'sales':
        return <SalesView />;
      case 'inventory':
        return <InventoryView />;
      case 'financial':
        return <FinancialView />;
      case 'ai-agent':
        return <AiAgentView />;
      case 'loyalty':
        return <LoyaltyView />;
      case 'omnichannel':
        return <OmnichannelInboxView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'supabase-sql':
        return <SupabaseSqlView />;
      default:
        return (
          <DashboardView
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            onOpenQuickSale={() => setActiveTab('sales')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
        onOpenQuickSale={() => setActiveTab('sales')}
      />

      {/* Main Workspace with Sidebar and Active View */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Quick Appointment Modal */}
      <AppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        initialTime="10:00"
      />
    </div>
  );
};

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}
