export type UserRole =
  | 'owner'
  | 'manager'
  | 'receptionist'
  | 'professional'
  | 'financial'
  | 'marketing'
  | 'client'
  | 'super_admin';

export interface TenantWhiteLabelConfig {
  salonName: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string; // e.g. '#e11d48'
  secondaryColor: string; // e.g. '#881337'
  accentColor: string; // e.g. '#fb7185'
  customDomain?: string;
  supportPhone: string;
  currencySymbol: string;
}

export interface TenantLimits {
  maxProfessionals: number;
  maxMonthlyAppointments: number;
  maxUnits: number;
  aiMonthlyTokens: number;
  whatsappIncluded: boolean;
}

export interface TenantPlan {
  id: string;
  name: 'Starter' | 'Pro' | 'Enterprise' | 'VIP Master';
  priceMonthly: number;
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'trial' | 'overdue' | 'suspended';
  limits: TenantLimits;
  features: string[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  planId: string;
  status: 'active' | 'trial' | 'suspended' | 'canceled';
  whiteLabelConfig: TenantWhiteLabelConfig;
  createdAt: string;
  contactEmail: string;
  contactPhone: string;
  documentCnpj?: string;
  unitsCount: number;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface CustomerPreference {
  key: string;
  value: string;
}

export interface CustomerConsent {
  type: 'lgpd_terms' | 'whatsapp_notifications' | 'marketing_promotions';
  accepted: boolean;
  acceptedAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  birthDate?: string;
  notes?: string;
  origin: 'whatsapp_ai' | 'walk_in' | 'instagram' | 'website' | 'indication' | 'other';
  active: boolean;
  totalSpent: number;
  appointmentsCount: number;
  lastVisitAt?: string;
  preferences: CustomerPreference[];
  consents: CustomerConsent[];
  loyaltyPoints: number;
  cashbackBalance: number;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  tenantId: string;
  name: string;
  order: number;
  iconName?: string;
}

export interface Service {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  active: boolean;
  requiredResources?: string[]; // e.g., 'Cadeira Lavatório', 'Cabine Estética 1'
}

export interface Combo {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  serviceIds: string[];
  active: boolean;
}

export interface ProfessionalSchedule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ...
  dayName: string;
  isWorking: boolean;
  startTime: string; // '09:00'
  endTime: string;   // '19:00'
  breakStartTime?: string; // '12:00'
  breakEndTime?: string;   // '13:00'
}

export interface Professional {
  id: string;
  tenantId: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  specialties: string[];
  serviceIds: string[];
  defaultCommissionPercentage: number;
  monthlyGoalRevenue?: number;
  schedules: ProfessionalSchedule[];
  active: boolean;
  ratingAverage: number;
  reviewsCount: number;
  createdAt: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  professionalId: string;
  serviceId: string;
  unitId: string;
  scheduledAt: string; // ISO string '2026-09-02T14:00:00'
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  source: 'whatsapp_yafit' | 'manual_reception' | 'online_booking' | 'app';
  cancellationReason?: string;
  cancellationFee?: number;
  isEncaixe?: boolean;
  createdAt: string;
}

export interface WaitingListItem {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  preferredProfessionalId?: string;
  preferredDate: string;
  preferredPeriod: 'morning' | 'afternoon' | 'night' | 'any';
  notes?: string;
  requestedAt: string;
  status: 'waiting' | 'notified' | 'scheduled' | 'expired';
}

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'payment_link' | 'loyalty_cashback';

export interface SaleItem {
  id: string;
  itemType?: 'service' | 'product' | 'combo';
  type?: 'service' | 'product' | 'combo';
  itemId?: string;
  referenceId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice?: number;
  total?: number;
  professionalId?: string;
}

export interface SalePayment {
  method: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'payment_link' | 'loyalty_cashback';
  amount: number;
  reference?: string;
}

export interface Sale {
  id: string;
  tenantId: string;
  customerId?: string;
  customerName?: string;
  appointmentId?: string;
  userId: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  pointsEarned: number;
  cashbackUsed: number;
  total: number;
  payments: SalePayment[];
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellPrice: number;
  stockQuantity: number;
  minStock: number;
  unit: 'un' | 'ml' | 'g' | 'kit' | 'cx';
  isForResale: boolean;
  isForInternalUse: boolean;
  supplierName?: string;
  active: boolean;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  type: 'entry' | 'sale' | 'internal_use' | 'adjustment' | 'return';
  quantity: number;
  reason: string;
  referenceId?: string;
  createdByName: string;
  createdAt: string;
}

export interface CashRegister {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  actualCashInDrawer?: number;
  difference?: number;
  status: 'open' | 'closed';
  summary: {
    totalSales: number;
    totalCash: number;
    totalPix: number;
    totalCards: number;
    totalExpenses: number;
  };
}

export interface FinancialTransaction {
  id: string;
  tenantId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'pix' | 'bank_transfer' | 'credit_card' | 'cash' | 'boleto';
  referenceId?: string;
  date: string;
  status: 'paid' | 'pending' | 'cancelled';
  dueDate?: string;
  supplierOrCustomerName?: string;
  createdAt: string;
}

export interface CommissionEntry {
  id: string;
  tenantId: string;
  professionalId: string;
  professionalName: string;
  saleId: string;
  serviceOrProductName: string;
  saleAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  paidAt?: string;
}

export interface AIAgentConfig {
  id: string;
  tenantId: string;
  name: string; // e.g. "Yafit"
  personality: 'amigavel_sofisticada' | 'direta_eficiente' | 'descontraida_jovem' | 'elegante_formal';
  toneDescription: string;
  activeHoursStart: string; // '08:00'
  activeHoursEnd: string;   // '22:00'
  enabled: boolean;
  allowDirectBooking: boolean;
  autoSendAppointmentReminder: boolean;
  reminderHoursBefore: number;
  customFaqPrompt: string;
  humanHandoffKeywords: string[];
}

export interface AIToolCall {
  id: string;
  conversationId: string;
  toolName:
    | 'consultar_cliente'
    | 'criar_cliente'
    | 'consultar_servicos'
    | 'consultar_preco'
    | 'consultar_profissionais'
    | 'buscar_horarios_disponiveis'
    | 'criar_agendamento'
    | 'reagendar'
    | 'cancelar_agendamento'
    | 'consultar_pedido'
    | 'criar_followup'
    | 'enviar_confirmacao';
  inputJson: Record<string, any>;
  outputJson: Record<string, any>;
  policyDecision: {
    allowed: boolean;
    tenantValidated: boolean;
    reason: string;
    requiresHumanApproval?: boolean;
  };
  createdAt: string;
}

export interface AIMessage {
  id: string;
  conversationId?: string;
  tenantId?: string;
  sender?: 'user' | 'yafit' | 'human';
  role?: 'user' | 'assistant' | 'system';
  text?: string;
  content?: string;
  timestamp?: string;
  confidenceScore?: number;
  actionTriggered?: string;
  toolCalls?: AIToolCall[];
  transferredToHuman?: boolean;
  createdAt?: string;
}

export type AiConversationMessage = AIMessage;

export interface AIConversation {
  id: string;
  tenantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  channel: 'whatsapp' | 'instagram' | 'web' | 'sms';
  status: any;
  transferredToHuman?: boolean;
  lastMessageSnippet?: string;
  messages: AIMessage[];
  startedAt?: string;
  updatedAt: string;
}

export type AiConversation = AIConversation;

export interface LoyaltyConfig {
  tenantId: string;
  pointsPerReal: number; // e.g., 1 pt per R$ 1
  cashbackPercent: number; // e.g., 5%
  pointValueInReais: number; // e.g., 100 pts = R$ 5
  levels: {
    name: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
    minSpent: number;
    cashbackBonusMultiplier: number;
    benefits: string[];
  }[];
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  usesLimit: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface MarketingCampaign {
  id: string;
  tenantId: string;
  name: string;
  type: 'birthday' | 'inactive_clients' | 'post_service_review' | 'promotional_blast';
  channel: 'whatsapp' | 'email' | 'push';
  content: string;
  targetCount: number;
  sentCount: number;
  convertedCount: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  scheduledAt: string;
}

export interface SalonUnit {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
