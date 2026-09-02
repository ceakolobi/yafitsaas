import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Tenant,
  TenantPlan,
  User,
  Customer,
  ServiceCategory,
  Service,
  Combo,
  Professional,
  Appointment,
  WaitingListItem,
  Sale,
  Product,
  StockMovement,
  CashRegister,
  FinancialTransaction,
  CommissionEntry,
  AIAgentConfig,
  AIConversation,
  AIMessage,
  AIToolCall,
  LoyaltyConfig,
  Coupon,
  MarketingCampaign,
  SalonUnit,
  AuditLog,
} from '../types';
import {
  INITIAL_PLANS,
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_UNITS,
  INITIAL_CUSTOMERS,
  INITIAL_SERVICE_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_COMBOS,
  INITIAL_PROFESSIONALS,
  INITIAL_APPOINTMENTS,
  INITIAL_WAITING_LIST,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SALES,
  INITIAL_CASH_REGISTERS,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMISSIONS,
  INITIAL_AI_CONFIGS,
  INITIAL_AI_CONVERSATIONS,
  INITIAL_LOYALTY_CONFIGS,
  INITIAL_COUPONS,
  INITIAL_CAMPAIGNS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

interface DatabaseContextType {
  // Active tenant & auth
  currentTenant: Tenant;
  setCurrentTenantId: (tenantId: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  tenants: Tenant[];
  plans: TenantPlan[];
  users: User[];
  isControlPlaneMode: boolean;
  setIsControlPlaneMode: (val: boolean) => void;

  // Tenant-scoped Data
  units: SalonUnit[];
  customers: Customer[];
  categories: ServiceCategory[];
  services: Service[];
  combos: Combo[];
  professionals: Professional[];
  appointments: Appointment[];
  waitingList: WaitingListItem[];
  products: Product[];
  stockMovements: StockMovement[];
  sales: Sale[];
  cashRegisters: CashRegister[];
  currentCashRegister: CashRegister | undefined;
  transactions: FinancialTransaction[];
  commissions: CommissionEntry[];
  aiConfig: AIAgentConfig;
  aiConversations: AIConversation[];
  activeConversation: AIConversation | undefined;
  setActiveConversationId: (id: string) => void;
  loyaltyConfig: LoyaltyConfig;
  coupons: Coupon[];
  campaigns: MarketingCampaign[];
  auditLogs: AuditLog[];

  // Actions
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'tenantId'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status'], reason?: string, fee?: number) => void;
  rescheduleAppointment: (id: string, newTime: string, newProfessionalId?: string) => void;
  addWaitingListItem: (item: Omit<WaitingListItem, 'id' | 'requestedAt' | 'tenantId' | 'status'>) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'tenantId' | 'totalSpent' | 'appointmentsCount' | 'loyaltyPoints' | 'cashbackBalance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addService: (srv: Omit<Service, 'id' | 'createdAt' | 'tenantId'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  addCombo: (combo: Omit<Combo, 'id' | 'tenantId'>) => void;
  addProfessional: (prof: Omit<Professional, 'id' | 'createdAt' | 'tenantId' | 'ratingAverage' | 'reviewsCount'>) => void;
  updateProfessional: (id: string, updates: Partial<Professional>) => void;
  createSale: (saleData: {
    customerId?: string;
    customerName?: string;
    appointmentId?: string;
    items: Sale['items'];
    discount: number;
    cashbackUsed: number;
    payments: Sale['payments'];
    notes?: string;
  }) => Sale;
  addProduct: (prod: Omit<Product, 'id' | 'tenantId' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addStockMovement: (productId: string, type: StockMovement['type'], quantity: number, reason: string) => void;
  openCashRegister: (openingBalance: number) => void;
  closeCashRegister: (actualCash: number) => void;
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdAt' | 'tenantId'>) => void;
  payCommission: (id: string) => void;
  updateAiConfig: (updates: Partial<AIAgentConfig>) => void;
  sendMessageToYafit: (userText: string, channel?: 'whatsapp' | 'instagram' | 'web') => Promise<AIMessage>;
  executeAIToolDirectly: (toolName: AIToolCall['toolName'], input: Record<string, any>) => Promise<AIToolCall>;
  transferConversationToHuman: (conversationId: string) => void;
  updateWhiteLabelConfig: (config: Partial<Tenant['whiteLabelConfig']>) => void;
  createTenant: (newTenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
  updateTenantStatus: (tenantId: string, status: Tenant['status']) => void;
  changeTenantPlan: (tenantId: string, planId: string) => void;
  resetToDefaultData: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const STORAGE_KEY = 'yafit_saas_db_v1';

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or default
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tenants`);
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_active_tenant_id`);
    return saved || 'tenant-bella-donna';
  });

  const [isControlPlaneMode, setIsControlPlaneMode] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return users.find((u) => u.tenantId === currentTenantId) || users[0];
  });

  const [units, setUnits] = useState<SalonUnit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_units`);
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_CATEGORIES;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [combos, setCombos] = useState<Combo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_combos`);
    return saved ? JSON.parse(saved) : INITIAL_COMBOS;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_professionals`);
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_appointments`);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [waitingList, setWaitingList] = useState<WaitingListItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_waiting_list`);
    return saved ? JSON.parse(saved) : INITIAL_WAITING_LIST;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stock_movements`);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cash_registers`);
    return saved ? JSON.parse(saved) : INITIAL_CASH_REGISTERS;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [commissions, setCommissions] = useState<CommissionEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_commissions`);
    return saved ? JSON.parse(saved) : INITIAL_COMMISSIONS;
  });

  const [aiConfigs, setAiConfigs] = useState<AIAgentConfig[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ai_configs`);
    return saved ? JSON.parse(saved) : INITIAL_AI_CONFIGS;
  });

  const [aiConversations, setAiConversations] = useState<AIConversation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ai_conversations`);
    return saved ? JSON.parse(saved) : INITIAL_AI_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string>('conv-101');

  const [loyaltyConfigs, setLoyaltyConfigs] = useState<LoyaltyConfig[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_loyalty_configs`);
    return saved ? JSON.parse(saved) : INITIAL_LOYALTY_CONFIGS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_coupons`);
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tenants`, JSON.stringify(tenants));
    localStorage.setItem(`${STORAGE_KEY}_active_tenant_id`, currentTenantId);
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
    localStorage.setItem(`${STORAGE_KEY}_units`, JSON.stringify(units));
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
    localStorage.setItem(`${STORAGE_KEY}_combos`, JSON.stringify(combos));
    localStorage.setItem(`${STORAGE_KEY}_professionals`, JSON.stringify(professionals));
    localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(appointments));
    localStorage.setItem(`${STORAGE_KEY}_waiting_list`, JSON.stringify(waitingList));
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    localStorage.setItem(`${STORAGE_KEY}_stock_movements`, JSON.stringify(stockMovements));
    localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
    localStorage.setItem(`${STORAGE_KEY}_cash_registers`, JSON.stringify(cashRegisters));
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${STORAGE_KEY}_commissions`, JSON.stringify(commissions));
    localStorage.setItem(`${STORAGE_KEY}_ai_configs`, JSON.stringify(aiConfigs));
    localStorage.setItem(`${STORAGE_KEY}_ai_conversations`, JSON.stringify(aiConversations));
    localStorage.setItem(`${STORAGE_KEY}_loyalty_configs`, JSON.stringify(loyaltyConfigs));
    localStorage.setItem(`${STORAGE_KEY}_coupons`, JSON.stringify(coupons));
    localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
    localStorage.setItem(`${STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
  }, [
    tenants,
    currentTenantId,
    users,
    units,
    customers,
    categories,
    services,
    combos,
    professionals,
    appointments,
    waitingList,
    products,
    stockMovements,
    sales,
    cashRegisters,
    transactions,
    commissions,
    aiConfigs,
    aiConversations,
    loyaltyConfigs,
    coupons,
    campaigns,
    auditLogs,
  ]);

  // Derived current tenant
  const currentTenant = useMemo(() => {
    return tenants.find((t) => t.id === currentTenantId) || tenants[0];
  }, [tenants, currentTenantId]);

  // Sync user when tenant changes
  useEffect(() => {
    const userForTenant = users.find((u) => u.tenantId === currentTenantId && u.role === 'owner');
    if (userForTenant) {
      setCurrentUser(userForTenant);
    }
  }, [currentTenantId, users]);

  // Filtered dataset for active tenant
  const tenantUnits = useMemo(() => units.filter((u) => u.tenantId === currentTenantId), [units, currentTenantId]);
  const tenantCustomers = useMemo(() => customers.filter((c) => c.tenantId === currentTenantId), [customers, currentTenantId]);
  const tenantCategories = useMemo(() => categories.filter((c) => c.tenantId === currentTenantId), [categories, currentTenantId]);
  const tenantServices = useMemo(() => services.filter((s) => s.tenantId === currentTenantId), [services, currentTenantId]);
  const tenantCombos = useMemo(() => combos.filter((c) => c.tenantId === currentTenantId), [combos, currentTenantId]);
  const tenantProfessionals = useMemo(() => professionals.filter((p) => p.tenantId === currentTenantId), [professionals, currentTenantId]);
  const tenantAppointments = useMemo(() => appointments.filter((a) => a.tenantId === currentTenantId), [appointments, currentTenantId]);
  const tenantWaitingList = useMemo(() => waitingList.filter((w) => w.tenantId === currentTenantId), [waitingList, currentTenantId]);
  const tenantProducts = useMemo(() => products.filter((p) => p.tenantId === currentTenantId), [products, currentTenantId]);
  const tenantStockMovements = useMemo(() => stockMovements.filter((s) => s.tenantId === currentTenantId), [stockMovements, currentTenantId]);
  const tenantSales = useMemo(() => sales.filter((s) => s.tenantId === currentTenantId), [sales, currentTenantId]);
  const tenantCashRegisters = useMemo(() => cashRegisters.filter((c) => c.tenantId === currentTenantId), [cashRegisters, currentTenantId]);
  const currentCashRegister = useMemo(() => tenantCashRegisters.find((c) => c.status === 'open'), [tenantCashRegisters]);
  const tenantTransactions = useMemo(() => transactions.filter((t) => t.tenantId === currentTenantId), [transactions, currentTenantId]);
  const tenantCommissions = useMemo(() => commissions.filter((c) => c.tenantId === currentTenantId), [commissions, currentTenantId]);
  const tenantAiConversations = useMemo(() => aiConversations.filter((c) => c.tenantId === currentTenantId), [aiConversations, currentTenantId]);
  const activeConversation = useMemo(() => tenantAiConversations.find((c) => c.id === activeConversationId) || tenantAiConversations[0], [tenantAiConversations, activeConversationId]);
  const tenantCoupons = useMemo(() => coupons.filter((c) => c.tenantId === currentTenantId), [coupons, currentTenantId]);
  const tenantCampaigns = useMemo(() => campaigns.filter((c) => c.tenantId === currentTenantId), [campaigns, currentTenantId]);
  const tenantAuditLogs = useMemo(() => auditLogs.filter((a) => a.tenantId === currentTenantId), [auditLogs, currentTenantId]);

  const aiConfig = useMemo(() => {
    return (
      aiConfigs.find((a) => a.tenantId === currentTenantId) || {
        id: `ai-cfg-${currentTenantId}`,
        tenantId: currentTenantId,
        name: 'Yafit',
        personality: 'amigavel_sofisticada',
        toneDescription: 'Amigável, atenciosa e ágil.',
        activeHoursStart: '08:00',
        activeHoursEnd: '22:00',
        enabled: true,
        allowDirectBooking: true,
        autoSendAppointmentReminder: true,
        reminderHoursBefore: 24,
        customFaqPrompt: 'Atendimento rápido e agendamentos diretos.',
        humanHandoffKeywords: ['humano', 'atendente', 'gerente'],
      }
    );
  }, [aiConfigs, currentTenantId]);

  const loyaltyConfig = useMemo(() => {
    return (
      loyaltyConfigs.find((l) => l.tenantId === currentTenantId) || {
        tenantId: currentTenantId,
        pointsPerReal: 1,
        cashbackPercent: 5,
        pointValueInReais: 0.05,
        levels: [
          { name: 'Bronze', minSpent: 0, cashbackBonusMultiplier: 1.0, benefits: ['5% Cashback'] },
          { name: 'Prata', minSpent: 1000, cashbackBonusMultiplier: 1.2, benefits: ['6% Cashback'] },
          { name: 'Ouro', minSpent: 2500, cashbackBonusMultiplier: 1.5, benefits: ['7.5% Cashback'] },
          { name: 'Diamante', minSpent: 5000, cashbackBonusMultiplier: 2.0, benefits: ['10% Cashback'] },
        ],
      }
    );
  }, [loyaltyConfigs, currentTenantId]);

  // Helper log generator
  const logAudit = (action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      tenantId: currentTenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entity,
      entityId,
      details,
      ipAddress: '189.40.122.98',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Actions
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt' | 'tenantId'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);

    // Update customer stats
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === aptData.customerId
          ? {
              ...c,
              appointmentsCount: c.appointmentsCount + 1,
              lastVisitAt: aptData.scheduledAt,
            }
          : c
      )
    );

    logAudit('CREATE_APPOINTMENT', 'Appointment', newApt.id, `Novo agendamento criado para ${aptData.scheduledAt}`);
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status'], reason?: string, fee?: number) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              cancellationReason: reason || a.cancellationReason,
              cancellationFee: fee !== undefined ? fee : a.cancellationFee,
            }
          : a
      )
    );
    logAudit('UPDATE_APPOINTMENT_STATUS', 'Appointment', id, `Status alterado para: ${status}${reason ? ` (Motivo: ${reason})` : ''}`);
  };

  const rescheduleAppointment = (id: string, newTime: string, newProfessionalId?: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              scheduledAt: newTime,
              professionalId: newProfessionalId || a.professionalId,
              status: 'confirmed',
            }
          : a
      )
    );
    logAudit('RESCHEDULE_APPOINTMENT', 'Appointment', id, `Reagendado para ${newTime}`);
  };

  const addWaitingListItem = (item: Omit<WaitingListItem, 'id' | 'requestedAt' | 'tenantId' | 'status'>) => {
    const newItem: WaitingListItem = {
      ...item,
      id: `wait-${Date.now()}`,
      tenantId: currentTenantId,
      requestedAt: new Date().toISOString(),
      status: 'waiting',
    };
    setWaitingList((prev) => [newItem, ...prev]);
    logAudit('ADD_WAITING_LIST', 'WaitingList', newItem.id, `Adicionado cliente ${item.customerName} à fila de espera`);
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'tenantId' | 'totalSpent' | 'appointmentsCount' | 'loyaltyPoints' | 'cashbackBalance'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      tenantId: currentTenantId,
      totalSpent: 0,
      appointmentsCount: 0,
      loyaltyPoints: 0,
      cashbackBalance: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAudit('CREATE_CUSTOMER', 'Customer', newCust.id, `Novo cliente cadastrado: ${newCust.name}`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit('UPDATE_CUSTOMER', 'Customer', id, `Dados atualizados do cliente ${id}`);
  };

  const addService = (srvData: Omit<Service, 'id' | 'createdAt' | 'tenantId'>) => {
    const newSrv: Service = {
      ...srvData,
      id: `srv-${Date.now()}`,
      tenantId: currentTenantId,
    };
    setServices((prev) => [...prev, newSrv]);
    logAudit('CREATE_SERVICE', 'Service', newSrv.id, `Novo serviço: ${newSrv.name} (R$ ${newSrv.price})`);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    logAudit('UPDATE_SERVICE', 'Service', id, `Serviço ${id} atualizado`);
  };

  const addCombo = (comboData: Omit<Combo, 'id' | 'tenantId'>) => {
    const newCombo: Combo = {
      ...comboData,
      id: `combo-${Date.now()}`,
      tenantId: currentTenantId,
    };
    setCombos((prev) => [...prev, newCombo]);
    logAudit('CREATE_COMBO', 'Combo', newCombo.id, `Novo combo criado: ${newCombo.name}`);
  };

  const addProfessional = (profData: Omit<Professional, 'id' | 'createdAt' | 'tenantId' | 'ratingAverage' | 'reviewsCount'>) => {
    const newProf: Professional = {
      ...profData,
      id: `prof-${Date.now()}`,
      tenantId: currentTenantId,
      ratingAverage: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProfessionals((prev) => [...prev, newProf]);
    logAudit('CREATE_PROFESSIONAL', 'Professional', newProf.id, `Profissional cadastrado: ${newProf.name}`);
  };

  const updateProfessional = (id: string, updates: Partial<Professional>) => {
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAudit('UPDATE_PROFESSIONAL', 'Professional', id, `Profissional ${id} atualizado`);
  };

  const createSale = (saleData: {
    customerId?: string;
    customerName?: string;
    appointmentId?: string;
    items: Sale['items'];
    discount: number;
    cashbackUsed: number;
    payments: Sale['payments'];
    notes?: string;
  }): Sale => {
    const subtotal = saleData.items.reduce((acc, item) => acc + item.total, 0);
    const total = Math.max(0, subtotal - saleData.discount - saleData.cashbackUsed);
    const pointsEarned = Math.floor(total * 0.1);

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      tenantId: currentTenantId,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      appointmentId: saleData.appointmentId,
      userId: currentUser.id,
      items: saleData.items,
      subtotal,
      discount: saleData.discount,
      pointsEarned,
      cashbackUsed: saleData.cashbackUsed,
      total,
      payments: saleData.payments,
      status: 'completed',
      notes: saleData.notes,
      createdAt: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

    // Update stock for product items
    saleData.items.forEach((item) => {
      if (item.itemType === 'product') {
        addStockMovement(item.itemId, 'sale', -item.quantity, `Venda PDV #${newSale.id}`);
      }

      // Generate commissions
      if (item.professionalId) {
        const prof = tenantProfessionals.find((p) => p.id === item.professionalId);
        const commPct = prof ? prof.defaultCommissionPercentage : 40;
        const commAmt = (item.total * commPct) / 100;

        const newComm: CommissionEntry = {
          id: `comm-${Date.now()}-${Math.random()}`,
          tenantId: currentTenantId,
          professionalId: item.professionalId,
          professionalName: prof?.name || 'Profissional',
          saleId: newSale.id,
          serviceOrProductName: item.name,
          saleAmount: item.total,
          commissionPercentage: commPct,
          commissionAmount: commAmt,
          status: 'approved',
          createdAt: new Date().toISOString(),
        };
        setCommissions((prev) => [newComm, ...prev]);
      }
    });

    // Update customer totalSpent & loyalty
    if (saleData.customerId) {
      const cashbackEarned = (total * loyaltyConfig.cashbackPercent) / 100;
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === saleData.customerId
            ? {
                ...c,
                totalSpent: c.totalSpent + total,
                loyaltyPoints: c.loyaltyPoints + pointsEarned,
                cashbackBalance: Math.max(0, c.cashbackBalance - saleData.cashbackUsed + cashbackEarned),
              }
            : c
        )
      );
    }

    // Update appointment to completed if attached
    if (saleData.appointmentId) {
      updateAppointmentStatus(saleData.appointmentId, 'completed');
    }

    // Register financial transaction
    const primaryPaymentMethod = saleData.payments[0]?.method || 'pix';
    const txMethod = primaryPaymentMethod === 'pix' ? 'pix' : primaryPaymentMethod === 'cash' ? 'cash' : 'credit_card';

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      tenantId: currentTenantId,
      type: 'income',
      category: 'Venda de Serviços e Produtos',
      amount: total,
      description: `Venda #${newSale.id} - ${saleData.customerName || 'Cliente Balcão'}`,
      paymentMethod: txMethod,
      referenceId: newSale.id,
      date: new Date().toISOString().split('T')[0],
      status: 'paid',
      supplierOrCustomerName: saleData.customerName,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    logAudit('CREATE_SALE', 'Sale', newSale.id, `Venda finalizada no valor de R$ ${total.toFixed(2)}`);
    return newSale;
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'tenantId' | 'createdAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      tenantId: currentTenantId,
    };
    setProducts((prev) => [...prev, newProd]);
    logAudit('CREATE_PRODUCT', 'Product', newProd.id, `Novo produto cadastrado: ${newProd.name}`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAudit('UPDATE_PRODUCT', 'Product', id, `Produto ${id} atualizado`);
  };

  const addStockMovement = (productId: string, type: StockMovement['type'], quantity: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newMov: StockMovement = {
      id: `mov-${Date.now()}-${Math.random()}`,
      tenantId: currentTenantId,
      productId,
      productName: prod.name,
      type,
      quantity,
      reason,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setStockMovements((prev) => [newMov, ...prev]);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: Math.max(0, p.stockQuantity + quantity) } : p))
    );
    logAudit('STOCK_MOVEMENT', 'Product', productId, `Movimentação de estoque (${type}): ${quantity} un.`);
  };

  const openCashRegister = (openingBalance: number) => {
    const newCash: CashRegister = {
      id: `cash-${Date.now()}`,
      tenantId: currentTenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      openedAt: new Date().toISOString(),
      openingBalance,
      status: 'open',
      summary: {
        totalSales: 0,
        totalCash: 0,
        totalPix: 0,
        totalCards: 0,
        totalExpenses: 0,
      },
    };
    setCashRegisters((prev) => [newCash, ...prev]);
    logAudit('OPEN_CASH_REGISTER', 'CashRegister', newCash.id, `Caixa aberto com R$ ${openingBalance.toFixed(2)}`);
  };

  const closeCashRegister = (actualCash: number) => {
    setCashRegisters((prev) =>
      prev.map((c) => {
        if (c.tenantId === currentTenantId && c.status === 'open') {
          const expectedCash = c.openingBalance + c.summary.totalCash - c.summary.totalExpenses;
          const diff = actualCash - expectedCash;
          return {
            ...c,
            status: 'closed',
            closedAt: new Date().toISOString(),
            closingBalance: actualCash,
            actualCashInDrawer: actualCash,
            difference: diff,
          };
        }
        return c;
      })
    );
    logAudit('CLOSE_CASH_REGISTER', 'CashRegister', 'current', `Caixa fechado com R$ ${actualCash.toFixed(2)} em gaveta`);
  };

  const addTransaction = (txData: Omit<FinancialTransaction, 'id' | 'createdAt' | 'tenantId'>) => {
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    logAudit('CREATE_TRANSACTION', 'Transaction', newTx.id, `${txData.type === 'income' ? 'Receita' : 'Despesa'}: R$ ${txData.amount} (${txData.description})`);
  };

  const payCommission = (id: string) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'paid', paidAt: new Date().toISOString() } : c))
    );
    logAudit('PAY_COMMISSION', 'Commission', id, `Comissão ${id} marcada como paga`);
  };

  const updateAiConfig = (updates: Partial<AIAgentConfig>) => {
    setAiConfigs((prev) => {
      const existing = prev.find((a) => a.tenantId === currentTenantId);
      if (existing) {
        return prev.map((a) => (a.tenantId === currentTenantId ? { ...a, ...updates } : a));
      }
      return [...prev, { ...aiConfig, ...updates, tenantId: currentTenantId }];
    });
    logAudit('UPDATE_AI_CONFIG', 'AIAgent', aiConfig.id, `Configurações da IA Yafit atualizadas`);
  };

  // AI Execution with Policy Engine
  const executeAIToolDirectly = async (toolName: AIToolCall['toolName'], input: Record<string, any>): Promise<AIToolCall> => {
    let outputJson: Record<string, any> = {};
    let allowed = true;
    let reason = `Execução de ${toolName} validada para tenant ${currentTenant.name}.`;

    switch (toolName) {
      case 'consultar_servicos': {
        outputJson = {
          services: tenantServices.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: `${s.durationMinutes} min`,
          })),
        };
        break;
      }
      case 'consultar_preco': {
        const queryName = (input.service_name || '').toLowerCase();
        const found = tenantServices.find((s) => s.name.toLowerCase().includes(queryName));
        if (found) {
          outputJson = { found: true, name: found.name, price: found.price, duration: found.durationMinutes };
        } else {
          outputJson = { found: false, message: 'Serviço não encontrado na tabela ativa' };
        }
        break;
      }
      case 'consultar_profissionais': {
        outputJson = {
          professionals: tenantProfessionals.map((p) => ({
            id: p.id,
            name: p.name,
            specialties: p.specialties,
            rating: p.ratingAverage,
          })),
        };
        break;
      }
      case 'buscar_horarios_disponiveis': {
        const availableSlots = ['09:30', '11:00', '14:00', '16:30', '18:00'];
        outputJson = {
          date: input.date || new Date().toISOString().split('T')[0],
          available_slots: availableSlots,
          salon: currentTenant.name,
        };
        break;
      }
      case 'criar_agendamento': {
        const defaultCust = tenantCustomers[0];
        const defaultProf = tenantProfessionals[0];
        const defaultSrv = tenantServices[0];

        const newApt = addAppointment({
          customerId: input.customer_id || defaultCust?.id || 'cust-1',
          professionalId: input.professional_id || defaultProf?.id || 'prof-lucas',
          serviceId: input.service_id || defaultSrv?.id || 'srv-mechas-balayage',
          unitId: tenantUnits[0]?.id || 'unit-jardins',
          scheduledAt: input.time || `${new Date().toISOString().split('T')[0]}T15:00:00`,
          durationMinutes: 60,
          status: 'confirmed',
          source: 'whatsapp_yafit',
          notes: 'Agendamento automático via Agente Yafit / Langflow Webhook',
        });
        outputJson = { success: true, appointment_id: newApt.id, scheduled_at: newApt.scheduledAt };
        break;
      }
      case 'cancelar_agendamento': {
        if (input.appointment_id) {
          updateAppointmentStatus(input.appointment_id, 'cancelled', input.reason || 'Cancelado via IA');
          outputJson = { success: true, message: 'Agendamento cancelado com sucesso' };
        } else {
          allowed = false;
          reason = 'ID do agendamento obrigatório para cancelamento.';
          outputJson = { success: false, error: reason };
        }
        break;
      }
      default: {
        outputJson = { status: 'executed', info: 'Tool processada com sucesso' };
      }
    }

    const toolCall: AIToolCall = {
      id: `tc-${Date.now()}-${Math.random()}`,
      conversationId: activeConversation?.id || 'conv-101',
      toolName,
      inputJson: input,
      outputJson,
      policyDecision: {
        allowed,
        tenantValidated: true,
        reason,
        requiresHumanApproval: false,
      },
      createdAt: new Date().toISOString(),
    };

    return toolCall;
  };

  const sendMessageToYafit = async (userText: string, channel: 'whatsapp' | 'instagram' | 'web' = 'whatsapp'): Promise<AIMessage> => {
    let conv = activeConversation;
    if (!conv) {
      const newConv: AIConversation = {
        id: `conv-${Date.now()}`,
        tenantId: currentTenantId,
        customerName: 'Cliente WhatsApp',
        customerPhone: '+55 11 99999-8888',
        channel,
        status: 'active',
        transferredToHuman: false,
        lastMessageSnippet: userText,
        messages: [],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAiConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      conv = newConv;
    }

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conv.id,
      tenantId: currentTenantId,
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    };

    // Check handoff keywords
    const lowerText = userText.toLowerCase();
    const needsHandoff = aiConfig.humanHandoffKeywords.some((k) => lowerText.includes(k.toLowerCase()));

    let assistantMsg: AIMessage;

    if (needsHandoff) {
      assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        conversationId: conv.id,
        tenantId: currentTenantId,
        role: 'assistant',
        content: `Com certeza! Estou transferindo seu atendimento para nossa recepcionista humana. Um instante por favor, já vão te responder por aqui! 👩‍💼`,
        transferredToHuman: true,
        createdAt: new Date().toISOString(),
      };
      transferConversationToHuman(conv.id);
    } else {
      // Analyze text for tool calling
      const isAskingPrice = lowerText.includes('preço') || lowerText.includes('valor') || lowerText.includes('quanto custa');
      const isAskingServices = lowerText.includes('serviço') || lowerText.includes('tratamento') || lowerText.includes('fazer');
      const isAskingBooking = lowerText.includes('agendar') || lowerText.includes('marcar') || lowerText.includes('horário') || lowerText.includes('hoje');

      const toolCalls: AIToolCall[] = [];

      let replyContent = '';

      if (isAskingPrice) {
        const matchedService = tenantServices.find((s) => lowerText.includes(s.name.toLowerCase().split(' ')[0])) || tenantServices[0];
        const toolCall = await executeAIToolDirectly('consultar_preco', { service_name: matchedService.name });
        toolCalls.push(toolCall);
        replyContent = `O valor do nosso **${matchedService.name}** é **R$ ${matchedService.price.toFixed(2)}** (duração média de ${matchedService.durationMinutes} minutos). ✨\n\nGostaria que eu verifique os horários disponíveis com nossos especialistas para você?`;
      } else if (isAskingBooking) {
        const toolCall = await executeAIToolDirectly('buscar_horarios_disponiveis', { date: new Date().toISOString().split('T')[0] });
        toolCalls.push(toolCall);
        replyContent = `Temos ótimos horários disponíveis hoje no ${currentTenant.name}!\n\n🕒 **Horários livres:** 09:30, 11:00, 14:00, 16:30 e 18:00.\n\nQual desses horários se encaixa melhor na sua rotina? Se quiser, já deixo reservado com o profissional de sua preferência!`;
      } else if (isAskingServices) {
        const toolCall = await executeAIToolDirectly('consultar_servicos', {});
        toolCalls.push(toolCall);
        const listText = tenantServices.slice(0, 4).map((s) => `• ${s.name} (R$ ${s.price})`).join('\n');
        replyContent = `Aqui no **${currentTenant.name}**, oferecemos uma experiência completa de beleza e bem-estar:\n\n${listText}\n\nAlém de tratamentos personalizados! Qual serviço você tem interesse em realizar?`;
      } else {
        replyContent = `Olá! Sou a **${aiConfig.name}**, assistente inteligente do **${currentTenant.name}**! ✨\n\nPosso te ajudar a consultar preços, agendar horários, tirar dúvidas sobre nossos procedimentos e gerenciar seus pontos de fidelidade. Como posso te mimar hoje?`;
      }

      assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        conversationId: conv.id,
        tenantId: currentTenantId,
        role: 'assistant',
        content: replyContent,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        createdAt: new Date().toISOString(),
      };
    }

    // Update conversation state
    setAiConversations((prev) =>
      prev.map((c) =>
        c.id === conv?.id
          ? {
              ...c,
              messages: [...c.messages, userMsg, assistantMsg],
              lastMessageSnippet: assistantMsg.content.slice(0, 80) + '...',
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    return assistantMsg;
  };

  const transferConversationToHuman = (conversationId: string) => {
    setAiConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, status: 'waiting_human', transferredToHuman: true } : c
      )
    );
    logAudit('TRANSFER_TO_HUMAN', 'AIConversation', conversationId, `Atendimento transferido para recepção humana`);
  };

  const updateWhiteLabelConfig = (config: Partial<Tenant['whiteLabelConfig']>) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === currentTenantId
          ? {
              ...t,
              whiteLabelConfig: { ...t.whiteLabelConfig, ...config },
            }
          : t
      )
    );
    logAudit('UPDATE_WHITELABEL', 'Tenant', currentTenantId, `Identidade visual e white-label atualizados`);
  };

  const createTenant = (newTenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newTenant: Tenant = {
      ...newTenantData,
      id: `tenant-${newTenantData.slug}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTenants((prev) => [...prev, newTenant]);
    logAudit('CREATE_TENANT', 'Tenant', newTenant.id, `Novo salão cadastrado no SaaS: ${newTenant.name}`);
  };

  const updateTenantStatus = (tenantId: string, status: Tenant['status']) => {
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, status } : t)));
    logAudit('UPDATE_TENANT_STATUS', 'Tenant', tenantId, `Status do salão alterado para ${status}`);
  };

  const changeTenantPlan = (tenantId: string, planId: string) => {
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, planId } : t)));
    logAudit('CHANGE_TENANT_PLAN', 'Tenant', tenantId, `Plano alterado para ${planId}`);
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setCurrentTenantId('tenant-bella-donna');
    setUsers(INITIAL_USERS);
    setUnits(INITIAL_UNITS);
    setCustomers(INITIAL_CUSTOMERS);
    setCategories(INITIAL_SERVICE_CATEGORIES);
    setServices(INITIAL_SERVICES);
    setCombos(INITIAL_COMBOS);
    setProfessionals(INITIAL_PROFESSIONALS);
    setAppointments(INITIAL_APPOINTMENTS);
    setWaitingList(INITIAL_WAITING_LIST);
    setProducts(INITIAL_PRODUCTS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setSales(INITIAL_SALES);
    setCashRegisters(INITIAL_CASH_REGISTERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCommissions(INITIAL_COMMISSIONS);
    setAiConfigs(INITIAL_AI_CONFIGS);
    setAiConversations(INITIAL_AI_CONVERSATIONS);
    setLoyaltyConfigs(INITIAL_LOYALTY_CONFIGS);
    setCoupons(INITIAL_COUPONS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <DatabaseContext.Provider
      value={{
        currentTenant,
        setCurrentTenantId,
        currentUser,
        setCurrentUser,
        tenants,
        plans: INITIAL_PLANS,
        users,
        isControlPlaneMode,
        setIsControlPlaneMode,

        units: tenantUnits,
        customers: tenantCustomers,
        categories: tenantCategories,
        services: tenantServices,
        combos: tenantCombos,
        professionals: tenantProfessionals,
        appointments: tenantAppointments,
        waitingList: tenantWaitingList,
        products: tenantProducts,
        stockMovements: tenantStockMovements,
        sales: tenantSales,
        cashRegisters: tenantCashRegisters,
        currentCashRegister,
        transactions: tenantTransactions,
        commissions: tenantCommissions,
        aiConfig,
        aiConversations: tenantAiConversations,
        activeConversation,
        setActiveConversationId,
        loyaltyConfig,
        coupons: tenantCoupons,
        campaigns: tenantCampaigns,
        auditLogs: tenantAuditLogs,

        addAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        addWaitingListItem,
        addCustomer,
        updateCustomer,
        addService,
        updateService,
        addCombo,
        addProfessional,
        updateProfessional,
        createSale,
        addProduct,
        updateProduct,
        addStockMovement,
        openCashRegister,
        closeCashRegister,
        addTransaction,
        payCommission,
        updateAiConfig,
        sendMessageToYafit,
        executeAIToolDirectly,
        transferConversationToHuman,
        updateWhiteLabelConfig,
        createTenant,
        updateTenantStatus,
        changeTenantPlan,
        resetToDefaultData,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
