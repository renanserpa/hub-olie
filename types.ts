// types.ts
// Fix: Add React import for React.ElementType
import React from 'react';

// --- CORE ---

export type UserRole =
  | 'AdminGeral'
  | 'Administrativo'
  | 'Producao'
  | 'Vendas'
  | 'Financeiro'
  | 'Conteudo';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  team_id?: string; // Added for team association
}

// FIX: Added CompanyProfile and Team types for the enhanced Settings module.
export interface CompanyProfile {
  id: string;
  legal_name: string;
  trade_name: string;
  cnpj: string;
  state_registration?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  contact_email: string;
  contact_phone: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id?: string; // User ID of the team manager
}


// --- SYSTEM AUDIT ---
export interface SystemAudit {
    id: string;
    key: string;
    status: string;
    details?: any;
    created_at: string;
}

// --- CONTACTS ---
export type ContactStage = 'Lead' | 'Cliente Ativo' | 'Contato Geral' | 'Fornecedor' | 'Inativo';


export interface ContactAddress {
    zip?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}

export interface Contact {
    id: string;
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    address?: ContactAddress;
    birth_date?: string; // or Date
    phones?: any; // based on sandboxDb
    stage?: ContactStage;
    tags?: string[];
    created_at?: string; // Added for activity feed
}
export type AnyContact = Omit<Contact, 'id'>;


// --- PRODUCTS & CATALOG ---

export interface ProductAttributes {
  external_fabric_color_ids?: string[];
  internal_lining_color_ids?: string[];
  zipper_color_ids?: string[];
  bias_color_ids?: string[];
  puller_color_ids?: string[];
  embroidery?: boolean;
  [key: string]: any; // Keep for backward compatibility during transition
}

export type ProductStatus = 'Rascunho' | 'Homologado Qualidade' | 'Ativo' | 'Suspenso' | 'Descontinuado';

export interface Product {
    id: string;
    name: string;
    description?: string;
    base_sku: string;
    base_price: number;
    category: string;
    hasVariants: boolean;
    status: ProductStatus;
    attributes?: ProductAttributes;
    collection_ids?: string[];
    images: string[];
    createdAt: string;
    updatedAt: string;
    bom?: { material_id: string; quantity_per_unit: number }[];
}

export type AnyProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
}

export interface Collection {
    id: string;
    name: string;
    description?: string;
}

export interface ConfigJson {
  fabricColor?: string;
  zipperColor?: string;
  biasColor?: string;
  embroidery?: {
    enabled: boolean;
    text: string;
    font: string;
  };
  notes?: string;
}

// --- ORDERS ---

export type OrderStatus = 'pending_payment' | 'paid' | 'in_production' | 'awaiting_shipping' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
  config_json?: ConfigJson;
  product?: Product;
}

export interface PaymentDetails {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  method: string;
  checkoutUrl?: string;
  transactionId?: string;
}

export interface FiscalDetails {
  status: 'pending' | 'authorized' | 'error' | 'cancelled';
  nfeNumber?: string;
  serie?: string;
  pdfUrl?: string;
  xmlUrl?: string;
}

export interface LogisticsDetails {
  status: 'pending' | 'label_created' | 'shipped' | 'in_transit' | 'delivered' | 'error';
  carrier?: string;
  service?: string;
  tracking?: string;
  labelUrl?: string;
}

export interface OrderPayment {
    id: string;
    date: string;
    amount: number;
    method: string;
    status: string;
}

export interface OrderTimelineEvent {
    id: string;
    created_at: string;
    description: string;
    user?: string;
}

export interface OrderNote {
    id: string;
    created_at: string;
    note: string;
    user: string;
}


export interface Order {
    id: string;
    number: string;
    customer_id: string;
    customers?: Contact;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    discounts: number;
    shipping_fee: number;
    total: number;
    notes?: string;
    origin?: string;
    created_at: string;
    updated_at: string;
    payments?: PaymentDetails;
    fiscal?: FiscalDetails;
    logistics?: LogisticsDetails;
    payments_history: OrderPayment[];
    timeline: OrderTimelineEvent[];
    notes_internal: OrderNote[];
}

// --- PRODUCTION (v6.1) ---
export type ProductionTaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type QualityCheckResult = 'Aprovado' | 'Reprovado' | 'Pendente';
// FIX: Standardized ProductionOrderStatus to a single, consistent set of Portuguese values.
export type ProductionOrderStatus = 'novo' | 'planejado' | 'em_andamento' | 'em_espera' | 'finalizado' | 'cancelado';
export type ProductionOrderPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface ProductionTask {
  id: string;
  production_order_id: string;
  name: string;
  status: ProductionTaskStatus;
  started_at?: string;
  finished_at?: string;
  notes?: string;
}

export interface ProductionQualityCheck {
  id: string;
  production_order_id: string;
  check_type: string; // e.g., 'Medidas', 'Costura', 'Acabamento'
  result: QualityCheckResult;
  inspector: string;
  notes?: string;
  created_at: string;
}

// FIX: Expand ProductionOrder to be more comprehensive.
export interface ProductionOrder {
  id: string;
  po_number: string;
  product_id: string;
  product?: Product;
  quantity: number;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  operator?: string;
  due_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  tasks?: ProductionTask[];
  quality_checks?: ProductionQualityCheck[];

  // For compatibility with older code
  order_code?: string;
  product_name?: string;
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
}


export interface ProductionAudit {
  id: string;
  order_id: string;
  action: string;
  performed_by: string;
  details?: any;
  created_at: string;
}

export interface TaskStatus {
    id: string;
    name: string;
    color: string;
    position: number;
}

export interface Task {
    id: string;
    title: string;
    status_id: string;
    client_name: string;
    quantity: number;
    position: number;
    priority?: 'baixa' | 'normal' | 'alta' | 'urgente';
}

// --- INVENTORY ---

export interface Warehouse {
    id: string;
    name: string;
    location: string;
}

export interface InventoryBalance {
    id: string;
    material_id: string;
    material?: Material;
    warehouse_id: string;
    warehouse?: Warehouse;
    current_stock: number;
    reserved_stock: number;
    location?: string;
    updated_at: string;
}

export type InventoryMovementType = 'in' | 'out' | 'adjust' | 'transfer';
export type InventoryMovementReason = 'RECEBIMENTO_PO' | 'CONSUMO_PRODUCAO' | 'VENDA_DIRETA' | 'AJUSTE_CONTAGEM' | 'DEVOLUCAO_CLIENTE' | 'PERDA_AVARIA' | 'TRANSFERENCIA_INTERNA';


export interface InventoryMovement {
    id: string;
    type: InventoryMovementType;
    reason: InventoryMovementReason;
    notes?: string;
    ref?: string;
    material_id: string;
    quantity: number; // For transfers, this is the amount transferred. Always positive.
    warehouse_id?: string; // For in, out, adjust
    from_warehouse_id?: string; // For transfers
    to_warehouse_id?: string; // For transfers
    created_at: string;
}

// --- MEDIA ---

export interface MediaAsset {
  id: string;
  drive_file_id: string;
  module: string;
  category?: string;
  name?: string;
  mime_type?: string;
  size?: number;
  url_public?: string;
  uploaded_by?: string;
  created_at: string;
}

// --- MATERIALS (NEW) ---
export interface MaterialGroup {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  sku?: string;
  group_id: string;
  config_supply_groups?: { name: string }; // For joins
  color_id?: string;
  config_color_palettes?: { hex_value: string };
  texture_id?: string;
  config_textures?: { url_public: string };
  unit: string;
  drive_file_id?: string;
  url_public?: string;
  ai_tags?: string[];
  is_active: boolean;
  created_at: string;
}


// --- SETTINGS ---
export type SettingsCategory = 'integrations' | 'catalogs' | 'materials' | 'system' | 'appearance' | 'security' | 'initializer';

export interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'checkbox' | 'color' | 'select' | 'file';
    options?: { value: string; label: string }[];
}

export interface ColorPalette { id: string; name: string; descricao?: string; is_active: boolean; }
export interface FabricColor { id: string; name: string; hex: string; palette_id?: string; is_active: boolean; }
export interface ZipperColor { id: string; name: string; hex: string; palette_id?: string; is_active: boolean; }
export interface LiningColor { id: string; name: string; hex: string; palette_id?: string; is_active: boolean; }
export interface PullerColor { id: string; name: string; hex: string; palette_id?: string; is_active: boolean; }
export interface BiasColor { id: string; name: string; hex: string; palette_id?: string; is_active: boolean; }
export interface EmbroideryColor { id: string; name: string; hex: string; palette_id?: string; thread_type: string; is_active: boolean; }
export interface FabricTexture {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  hex_code?: string;
  fabric_color_id?: string;
  supplier_sku?: string;
  manufacturer_sku?: string;
  manufacturer_id?: string;
  distributor_id?: string;
  is_active: boolean;
}
export interface MonogramFont { id: string; name: string; style: string; category: string; preview_url: string; font_file_url: string; is_active: boolean; }

export interface DeliveryMethod { id: string; name: string; description?: string; is_active: boolean; }
export interface FreightParams { id: string; name: string; value: string; }
export interface PackagingType { id: string; name: string; length: number; width: number; height: number; weight: number; }
export interface BondType { id: string; name: string; description: string; }

export type AnySettingsItem =
  | ColorPalette | FabricColor | ZipperColor | LiningColor | PullerColor | BiasColor
  | EmbroideryColor | FabricTexture | MonogramFont
  | MaterialGroup | Material;

export interface SystemSetting {
    id: string;
    key: string;
    value: any;
    category: string;
    description: string;
}

export interface SystemSettingsLog {
  id: string;
  key: string;
  old_value: any;
  new_value: any;
  source_module: string;
  confidence: number;
  explanation: string;
  created_at: string;
}

export type IntegrationType = 'ERP' | 'Ecommerce' | 'Transport' | 'Messaging' | 'Finance';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  endpoint_url: string;
  api_key?: string; // Should not be sent to client
  status: IntegrationStatus;
  last_sync?: string;
  last_error?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  integration_id: string;
  event: string;
  message: string;
  created_at: string;
}

// --- OMNICHANNEL ---
export type Channel = 'whatsapp' | 'instagram' | 'site';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type ConversationStatus = 'open' | 'closed' | 'pending';
export type MessageDirection = 'in' | 'out' | 'note';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface Conversation {
    id: string;
    customerId: string;
    customerName: string;
    customerHandle: string; // e.g., @username or phone number
    channel: Channel;
    status: ConversationStatus;
    assigneeId?: string;
    priority: Priority;
    tags: string[];
    unreadCount: number;
    lastMessageAt: string; // ISO string
    title: string;
    quoteId?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    direction: MessageDirection;
    content: string;
    authorName: string;
    createdAt: string; // ISO string
    status: MessageStatus;
}

export interface QuoteItem {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Quote {
    id: string;
    status: QuoteStatus;
    items: QuoteItem[];
    totals: {
        subtotal: number;
        shipping: number;
        grandTotal: number;
    };
}


// --- LOGISTICS ---
export type WaveStatus = 'pending' | 'picking' | 'packing' | 'completed' | 'cancelled';
export type ShipmentStatus = 'pending' | 'quoted' | 'label_created' | 'in_transit' | 'delivered' | 'error' | 'cancelled';
export type LogisticsTab = 'queue' | 'picking' | 'shipment' | 'settings';

export interface LogisticsWave {
    id: string;
    wave_number: string;
    status: WaveStatus;
    order_ids: string[];
    created_by: string;
    created_at: string;
}

export interface LogisticsShipment {
    id: string;
    order_id: string;
    order_number: string;
    customer_name: string;
    status: ShipmentStatus;
    tracking_code?: string;
    created_at: string;
}

// --- MARKETING ---
export type MarketingCampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type MarketingChannel = 'email' | 'sms' | 'whatsapp' | 'instagram';

export interface MarketingCampaignKPIs {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    replies: number;
    orders: number;
    revenue: number;
}

export interface MarketingCampaign {
    id: string;
    name: string;
    description?: string;
    status: MarketingCampaignStatus;
    channels: MarketingChannel[];
    segment_id?: string;
    template_id?: string;
    budget: number;
    spent: number;
    kpis: MarketingCampaignKPIs;
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
    scheduled_at?: string;
}

export interface MarketingSegmentRule {
    id: string;
    field: 'total_spent' | 'order_count' | 'last_purchase_days' | 'tags';
    operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'not_contains';
    value: string | number;
}

export interface MarketingSegment {
    id: string;
    name: string;
    description: string;
    rules: MarketingSegmentRule[];
    audience_size: number;
}

export interface MarketingTemplate {
    id: string;
    name: string;
    channel: MarketingChannel;
    content_preview: string;
}

// --- PURCHASING ---
export type PaymentTerms = "à vista" | "15D" | "30D" | "45D" | "60D";

export interface Supplier {
    id: string;
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    payment_terms: PaymentTerms;
    lead_time_days?: number | null;
    rating?: number | null;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type PurchaseOrderStatus = 'draft' | 'issued' | 'partial' | 'received' | 'canceled';

export interface PurchaseOrderItem {
    id: string;
    po_id: string;
    material_id: string;
    material?: Material; // For UI joins
    material_name?: string;
    quantity: number;
    received_quantity: number;
    unit_price: number;
    total: number;
}

export interface PurchaseOrder {
    id: string;
    po_number: string;
    supplier_id: string;
    supplier?: Supplier;
    status: PurchaseOrderStatus;
    items: PurchaseOrderItem[];
    total: number;
    created_at: string;
    updated_at: string;
    issued_at?: string;
    received_at?: string;
    expected_delivery_date?: string;
}

// --- ANALYTICS ---
export type AnalyticsModule = 'orders' | 'production' | 'inventory' | 'logistics' | 'financial' | 'marketing' | 'overview';

export interface AnalyticsKPI {
    id: string;
    module: AnalyticsModule;
    name: string;
    value: string | number;
    trend?: number; // e.g., 0.15 for +15%
    unit?: string; // e.g., '%', 'R$', 'dias'
    description: string;
}

export interface AnalyticsSnapshot {
    id: string;
    kpi_id: string;
    value: number;
    captured_at: string;
}


// --- EXECUTIVE DASHBOARD ---
export type ExecutiveModule = 'overview' | 'financial' | 'production' | 'sales' | 'logistics' | 'purchasing' | 'ai_insights';

export interface ExecutiveKPI {
    id: string;
    module: ExecutiveModule;
    name: string;
    value: string | number;
    trend: number; // e.g., 0.15 for +15%
    unit?: string;
    period: string; // e.g., 'Q4 2024'
    description: string;
}

export type AIInsightType = 'opportunity' | 'positive' | 'risk';

export interface AIInsight {
    id: string;
    module: ExecutiveModule;
    type: AIInsightType;
    insight: string;
    period: string;
    generated_at: string;
}

// --- FINANCE ---
export type FinanceAccountType = 'checking' | 'savings' | 'investment' | 'credit_card' | 'cash';
export type FinanceTransactionType = 'income' | 'expense' | 'transfer';

export interface FinanceAccount {
    id: string;
    name: string;
    type: FinanceAccountType;
    institution: string; // e.g., 'Bradesco', 'NuBank'
    balance: number;
    currency: 'BRL';
    is_active: boolean;
}

export interface FinanceCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    parent_category_id?: string;
}

export interface FinanceTransaction {
    id: string;
    account_id: string;
    account?: FinanceAccount;
    category_id?: string;
    category?: FinanceCategory;
    description: string;
    amount: number; // positive for income, negative for expense
    type: FinanceTransactionType;
    transaction_date: string; // ISO string
    status: 'pending' | 'cleared' | 'cancelled';
    notes?: string;
    created_at: string;
}

export interface FinancePayable {
    id: string;
    due_date: string;
    amount: number;
    supplier_id: string;
    purchase_order_id?: string;
    status: 'pending' | 'paid' | 'overdue';
}

export interface FinanceReceivable {
    id: string;
    due_date: string;
    amount: number;
    customer_id: string;
    order_id?: string;
    status: 'pending' | 'paid' | 'overdue';
}

// --- INITIALIZER & AI ---
export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'error' | 'offline';
  last_heartbeat: string;
  health_score: number;
  logs?: string[];
}

export type InitializerAgent = AgentStatus; // Consolidate type

export interface InitializerLog {
  id: string;
  agent_name: string;
  module?: string;
  action: string;
  status: 'running' | 'success' | 'error' | 'info';
  timestamp: string;
  metadata?: any;
}

export interface InitializerSyncState {
  id: string;
  module: string;
  last_commit?: string;
  last_diff?: string;
  updated_at: string;
}

// --- WORKFLOWS ---
export interface WorkflowRule {
    id: string;
    name: string;
    trigger: string;
    action: string;
    is_active: boolean;
    description: string;
}

// --- DASHBOARD ---
export interface ActivityItem {
  id: string;
  type: 'order' | 'contact' | 'production' | 'system_log';
  timestamp: string;
  title: string;
  description: string;
  value?: string | number;
  icon: React.ElementType;
}

// --- NOTIFICATIONS ---
export type NotificationType = 'order_created' | 'stock_low' | 'task_assigned' | 'system_alert';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}


// --- AppData ---
export interface AppData {
    catalogs: {
        paletas_cores: ColorPalette[];
        cores_texturas: {
            tecido: FabricColor[];
            ziper: ZipperColor[];
            forro: LiningColor[];
            puxador: PullerColor[];
            vies: BiasColor[];
            bordado: EmbroideryColor[];
            texturas: FabricTexture[];
        };
        fontes_monogramas: MonogramFont[];
    };
    logistica: {
        metodos_entrega: DeliveryMethod[];
        calculo_frete: FreightParams[];
        tipos_embalagem: PackagingType[];
        tipos_vinculo: BondType[];
    };
    sistema: SystemSetting[];
    system_settings_logs: SystemSettingsLog[];
    config_integrations: Integration[];
    integration_logs: IntegrationLog[];
    
    // New Materials Structure
    config_supply_groups: MaterialGroup[];
    config_materials: Material[];
    
    // New Inventory Structure
    warehouses: Warehouse[];

    media_assets: MediaAsset[];
    orders: Order[];
    contacts: Contact[];
    products: Product[];
    product_categories: ProductCategory[];
    collections: Collection[];
    production_orders: ProductionOrder[];
    production_audit: ProductionAudit[];
    // FIX: Add missing production task-related arrays to AppData
    production_tasks: ProductionTask[];
    production_quality_checks: ProductionQualityCheck[];
    task_statuses: TaskStatus[];
    tasks: Task[];
    omnichannel: {
        conversations: Conversation[];
        messages: Message[];
        quotes: Quote[];
    };
    inventory_balances: InventoryBalance[];
    inventory_movements: InventoryMovement[];
    marketing_campaigns: MarketingCampaign[];
    marketing_segments: MarketingSegment[];
    marketing_templates: MarketingTemplate[];
    suppliers: Supplier[];
    purchase_orders: PurchaseOrder[];
    purchase_order_items: PurchaseOrderItem[];
    analytics_kpis: AnalyticsKPI[];
    analytics_snapshots: AnalyticsSnapshot[];
    executive_kpis: ExecutiveKPI[];
    executive_ai_insights: AIInsight[];
    finance_accounts: FinanceAccount[];
    finance_categories: FinanceCategory[];
    finance_transactions: FinanceTransaction[];
    finance_payables: FinancePayable[];
    finance_receivables: FinanceReceivable[];
    initializer_logs: InitializerLog[];
    initializer_sync_state: InitializerSyncState[];
    initializer_agents: InitializerAgent[];
    workflow_rules: WorkflowRule[];
    notifications: Notification[];
    system_audit: SystemAudit[];
}