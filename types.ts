// types.ts
import React from 'react';

// --- CORE & SETTINGS ---

export type UserRole =
  | 'AdminGeral'
  | 'Administrativo'
  | 'Producao'
  | 'Vendas'
  | 'Financeiro'
  | 'Conteudo';

export interface User {
  // FIX: Changed from uid to id for consistency with UserProfile
  id: string;
  email: string;
  role: UserRole;
  team_id?: string;
}

// FIX: Add AuthUser interface to centralize user-related types and resolve import errors.
export interface AuthUser {
  // FIX: Changed from uid to id for consistency with UserProfile
  id: string;
  email: string;
  role: UserRole;
}

export interface UserProfile {
  id: string; // Corresponds to auth.users.id
  email: string;
  role: UserRole;
  created_at?: string;
  last_login?: string | null;
}

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
  manager_id?: string;
}

export type SettingsCategory = 'catalogs' | 'materials' | 'logistica' | 'sistema' | 'integrations' | 'appearance' | 'security';

export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    category: string;
    description: string;
}

export interface SystemSettingsLog {
    id: string;
    key: string;
    old_value: string;
    new_value: string;
    source_module: 'user' | 'AI';
    confidence: number;
    explanation: string;
    created_at: string;
}

export interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'color' | 'file';
    options?: { value: string; label: string }[];
}


// --- SYSTEM & INITIALIZER ---

export interface SystemRole {
    id: string;
    name: UserRole;
    description: string;
}

export interface SystemPermission {
    id: string;
    role: UserRole;
    scope: string;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
}

export interface SystemSettingsHistory {
    id: string;
    setting_id: string;
    setting_key: string;
    old_value: string;
    new_value: string;
    changed_by: string; // user email or 'AI'
    created_at: string;
}

export interface WebhookLog {
    id: string;
    integration_id: string;
    payload: any;
    status: 'success' | 'error' | 'retrying' | 'failed';
    retry_count: number;
    created_at: string;
    last_error?: string;
    next_retry_at?: string;
    correlation_id?: string;
}

export interface GovernanceSuggestion {
    id: string;
    setting_key: string;
    suggested_value: any;
    explanation: string;
    confidence: number;
    status: 'suggested' | 'accepted' | 'rejected';
    created_at: string;
}

export interface SystemAudit {
    id: string;
    key: string;
    status: string;
    details?: any;
    created_at: string;
}

export type AgentStatus = 'idle' | 'working' | 'error' | 'offline';

export interface InitializerAgent {
    id: string;
    name: string;
    role: string;
    category: string;
    status: AgentStatus;
    last_heartbeat: string;
    health_score?: number;
}

export type LogStatus = 'running' | 'success' | 'error' | 'info';

export interface InitializerLog {
    id: string;
    agent_name: string;
    module?: string;
    action: string;
    status: LogStatus;
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

export type IntegrationStatus = "connected" | "disconnected" | "error";

export interface Integration {
    id: string;
    name: string;
    description: string;
    api_key: string;
    endpoint_url: string;
    status: IntegrationStatus;
    is_active: boolean;
    last_sync: string | null;
    last_error?: string;
}

export interface IntegrationLog {
    id: string;
    integration_id: string;
    event: string;
    message: string;
    created_at: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface WorkflowRule {
    id: string;
    name: string;
    description: string;
    trigger: string;
    action: string;
    is_active: boolean;
    type?: 'standard' | 'cognitive';
}

export interface EdgeHealthStatus {
  name: string;
  status: 'ok' | 'error' | 'timeout';
  responseTime: number;
}

export interface RlsPolicyStatus {
  table: string;
  policyName: string;
  isEnabled: boolean;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  roles: string[];
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
    birth_date?: string;
    phones?: any;
    stage?: ContactStage;
    tags?: string[];
    created_at?: string;
}
export type AnyContact = Omit<Contact, 'id'>;


// --- PRODUCTS, CATALOG & MATERIALS ---

export interface Supplier {
    id: string;
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    payment_terms: "à vista" | "15D" | "30D" | "45D" | "60D";
    lead_time_days?: number | null;
    rating?: number | null;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

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
    unit: 'm' | 'un' | 'kg';
    is_active: boolean;
    created_at: string;
    url_public?: string;
    drive_file_id?: string;
    description?: string;
    supplier_id?: string;
    supplier?: Supplier;
    default_cost?: number;
    low_stock_threshold?: number;
    config_supply_groups?: { name: string };
    care_instructions?: string;
    technical_specs?: {
        composition?: string;
        weight_gsm?: number;
        thickness_mm?: number;
    }
}

export interface ColorPalette { id: string; name: string; descricao: string; is_active: boolean; }
export interface FabricColor { id: string; name: string; hex: string; palette_id: string; is_active: boolean; }
export interface ZipperColor { id: string; name: string; hex: string; palette_id: string; is_active: boolean; }
export interface BiasColor { id: string; name: string; hex: string; palette_id: string; is_active: boolean; }
export interface LiningColor { id: string; name: string; hex: string; palette_id: string; is_active: boolean; }
export interface PullerColor { id: string; name: string; hex: string; palette_id: string; is_active: boolean; }
export interface EmbroideryColor { id: string; name: string; hex: string; thread_type: string; is_active: boolean; }
export interface FabricTexture { id: string; name: string; description: string; image_url: string; hex_code: string; fabric_color_id: string; supplier_sku: string; manufacturer_sku: string; manufacturer_id: string; distributor_id: string; is_active: boolean; }
export interface MonogramFont { id: string; name: string; style: string; category: string; preview_url: string; font_file_url: string; is_active: boolean; }

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

export type AnySettingsItem =
    | ColorPalette | FabricColor | ZipperColor | BiasColor | MonogramFont | MaterialGroup | Material
    // FIX: Add ProductCategory and Collection to the union type to resolve assignment errors in CatalogManagement.
    | LiningColor | PullerColor | EmbroideryColor | FabricTexture | ProductCategory | Collection
    // FIX: Add ProductionRoute and MoldLibrary to support the production settings panel's TabContent component.
    | ProductionRoute
    | MoldLibrary;

export type ProductStatus = 'Rascunho' | 'Homologado Qualidade' | 'Ativo' | 'Suspenso' | 'Descontinuado';

export interface ProductSize {
  id: string;
  name: string;
  dimensions?: { width?: number; height?: number; depth?: number; };
}

export interface ProductPart {
  id: string;
  key: string;
  name: string;
  options_source: 'fabric_colors' | 'zipper_colors' | 'lining_colors' | 'puller_colors' | 'bias_colors' | 'embroidery_colors' | 'config_materials';
}

export interface CombinationRule {
  id: string;
  condition: {
    part_key: string;
    option_id: string;
  };
  consequence: {
    part_key: string;
    allowed_option_ids: string[];
  };
}

export interface BOMComponent {
  material_id: string;
  quantity_per_unit: number;
}

export interface ProductAttributes {
  external_fabric_color_ids?: string[];
  internal_lining_color_ids?: string[];
  zipper_color_ids?: string[];
  bias_color_ids?: string[];
  puller_color_ids?: string[];
  personalization?: {
    embroidery?: {
      enabled: boolean;
      allowed_font_ids?: string[];
      allowed_color_ids?: string[];
      max_chars?: number;
    };
    hot_stamping?: {
      enabled: boolean;
      allowed_color_ids?: string[];
      max_chars?: number;
    }
  }
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    base_sku: string;
    base_price: number;
    category: string;
    status: ProductStatus;
    collection_ids?: string[];
    images: string[];
    createdAt: string;
    updatedAt: string;
    available_sizes?: ProductSize[];
    configurable_parts?: ProductPart[];
    combination_rules?: CombinationRule[];
    base_bom?: BOMComponent[];
    attributes?: ProductAttributes;
    hasVariants?: boolean;
}

export interface ProductVariant {
  id: string;
  product_base_id: string;
  sku: string;
  name: string;
  configuration: Record<string, string>;
  price_modifier: number;
  final_price: number;
  dimensions?: { width: number; height: number; depth: number };
  bom: BOMComponent[];
  stock_quantity?: number;
}

export type AnyProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface ConfigJson {
  fabricColor?: string;
  zipperColor?: string;
  biasColor?: string;
  embroidery?: {
    enabled: boolean;
    text: string;
    font: string;
    color?: string;
  };
  notes?: string;
}

// --- ORDERS ---

export type OrderStatus = 'pending_payment' | 'paid' | 'in_production' | 'awaiting_shipping' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_sku?: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
  config_json?: ConfigJson | Record<string, any>;
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
    // FIX: Add optional payments_history, timeline, and notes_internal properties to resolve type errors in dataService.
    payments_history?: OrderPayment[];
    timeline?: OrderTimelineEvent[];
    notes_internal?: OrderNote[];
}


// --- PRODUCTION ---
export type ProductionTaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type QualityCheckResult = 'Aprovado' | 'Reprovado' | 'Pendente';
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
  // FIX: Add optional created_at property to resolve sorting error in useProduction hook.
  created_at?: string;
}

export interface ProductionQualityCheck {
  id: string;
  production_order_id: string;
  inspector: string;
  result: QualityCheckResult;
  notes: string;
  created_at: string;
}

export interface ProductionOrder {
    id: string;
    po_number: string;
    product_id: string;
    variant_sku?: string;
    product?: Product;
    product_name?: string;
    quantity: number;
    status: ProductionOrderStatus;
    priority: ProductionOrderPriority;
    due_date: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    operator?: string;
    notes?: string;
    order_code?: string;
    assigned_to?: string;
    start_date?: string;
    end_date?: string;
}

export interface ProductionAudit {
    id: string;
    production_order_id: string;
    event: string;
    details: any;
    created_at: string;
}

export interface ProductionRoute {
    id: string;
    produto: string;
    tamanho: string;
    rota: string[];
    tempos_std_min: Record<string, number>;
}

export interface MoldLibrary {
    id: string;
    codigo: string;
    produto: string;
    descricao: string;
    local_armazenamento: string;
}

// --- OMNICHANNEL ---
export type Channel = 'whatsapp' | 'instagram' | 'site';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationStatus = 'open' | 'closed' | 'pending';

// FIX: Add missing Omnichannel types
export interface Conversation {
    id: string;
    customerId: string;
    customerName: string;
    customerHandle?: string;
    channel: Channel;
    status: ConversationStatus;
    assigneeId?: string;
    priority: Priority;
    tags: string[];
    unreadCount: number;
    lastMessageAt: string; // or Date
    title: string;
    quoteId?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    direction: 'in' | 'out' | 'note';
    content: string;
    authorName?: string;
    createdAt: string; // or Date
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
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    items: QuoteItem[];
    totals: {
        subtotal: number;
        shipping: number;
        grandTotal: number;
    };
}

// --- INVENTORY ---
// FIX: Add missing Inventory types
export interface Warehouse {
    id: string;
    name: string;
    location?: string;
}

export interface InventoryBalance {
    id: string;
    material_id: string;
    product_variant_id?: string | null;
    warehouse_id: string;
    current_stock: number;
    reserved_stock: number;
    location?: string;
    updated_at: string;
    material?: Material;
    product_variant?: ProductVariant;
    warehouse?: Warehouse;
}

export type InventoryMovementType = 'in' | 'out' | 'adjust' | 'transfer';
export type InventoryMovementReason = 
    | 'RECEBIMENTO_PO' 
    | 'CONSUMO_PRODUCAO' 
    | 'VENDA_DIRETA' 
    | 'AJUSTE_CONTAGEM' 
    | 'DEVOLUCAO_CLIENTE' 
    | 'PERDA_AVARIA' 
    | 'TRANSFERENCIA_INTERNA'
    | 'ENTRADA_PRODUCAO';

export interface InventoryMovement {
    id: string;
    material_id?: string;
    product_variant_id?: string;
    type: InventoryMovementType;
    quantity: number;
    reason: InventoryMovementReason;
    ref?: string; // PO number, Order number, etc.
    notes?: string;
    warehouse_id?: string;
    created_at: string;
}

// --- LOGISTICS ---
export type LogisticsTab = 'queue' | 'picking' | 'shipment' | 'settings';
export type ShipmentStatus = 'pending' | 'quoted' | 'label_created' | 'in_transit' | 'delivered';

export interface LogisticsWave {
    id: string;
    wave_number: string;
    status: 'pending' | 'picking' | 'packing' | 'completed';
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

export interface LogisticsPickTask {
    id: string;
    wave_id: string;
    order_id: string;
    order_item_id: string;
    product_name: string;
    variant_sku?: string | null;
    quantity: number;
    picked_quantity: number;
    status: 'pending' | 'picking' | 'picked';
    picker_id?: string | null;
    picked_at?: string | null;
    created_at: string;
}

// --- MARKETING ---
// FIX: Add missing Marketing types
export type MarketingChannel = 'email' | 'sms' | 'whatsapp' | 'instagram';
export type MarketingCampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface MarketingCampaign {
    id: string;
    name: string;
    description?: string;
    status: MarketingCampaignStatus;
    channels: MarketingChannel[];
    budget: number;
    spent: number;
    kpis: {
        sent: number;
        delivered: number;
        read: number;
        clicked: number;
        replies: number;
        orders: number;
        revenue: number;
    };
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
    scheduled_at?: string;
    segment_id?: string;
    template_id?: string;
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
    description?: string;
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
// FIX: Add missing Purchasing types
export type PurchaseOrderStatus = 'draft' | 'issued' | 'partial' | 'received' | 'canceled';

export interface PurchaseOrder {
    id: string;
    po_number: string;
    supplier_id: string;
    status: PurchaseOrderStatus;
    total: number;
    created_at: string;
    updated_at: string;
    issued_at?: string;
    received_at?: string;
    expected_delivery_date?: string;
    supplier?: Supplier;
    items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: string;
    po_id: string;
    material_id: string;
    material_name?: string;
    quantity: number;
    received_quantity: number;
    unit_price: number;
    total: number;
    material?: Material;
}

// --- ANALYTICS ---
// FIX: Add missing Analytics types
export type AnalyticsModule = 'overview' | 'orders' | 'production' | 'inventory' | 'logistics' | 'financial' | 'marketing';

export interface AnalyticsKPI {
    id: string;
    module: AnalyticsModule;
    name: string;
    value: string | number;
    trend?: number;
    unit?: string;
    description?: string;
}

export interface AnalyticsSnapshot {
    id: string;
    kpi_id: string;
    value: number;
    recorded_at: string;
}

// --- EXECUTIVE ---
// FIX: Add missing Executive types
export type ExecutiveModule = 'overview' | 'financial' | 'production' | 'sales' | 'logistics' | 'purchasing' | 'ai_insights';

export interface ExecutiveKPI {
    id: string;
    module: ExecutiveModule;
    name: string;
    value: number;
    trend: number;
    unit?: string;
    period: string;
    description: string;
}

export interface AIInsight {
    id: string;
    module: ExecutiveModule;
    type: 'opportunity' | 'positive' | 'risk';
    insight: string;
    period: string;
    generated_at: string;
}

// --- FINANCE ---
// FIX: Add missing Finance types
export interface FinanceAccount {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'investment' | 'credit';
    balance: number;
}

export interface FinanceCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    parent_category_id?: string | null;
}

export interface FinanceTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    status: 'cleared' | 'pending' | 'cancelled';
    account_id: string;
    category_id: string;
    notes?: string;
    created_at: string;
    account?: FinanceAccount;
    category?: FinanceCategory;
}

export interface FinancePayable {
    id: string;
    purchase_order_id: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
}

export interface FinanceReceivable {
    id: string;
    order_id: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
}

// --- TASK MANAGEMENT ---
// FIX: Add missing Task types
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
    priority: 'baixa' | 'normal' | 'alta' | 'urgente';
}

// --- MEDIA ---
// FIX: Add MediaAsset type
export interface MediaAsset {
    id: string;
    drive_file_id: string;
    module: string;
    category: string;
    name: string;
    mime_type?: string;
    size?: number;
    url_public: string;
    // FIX: Make created_at optional to allow creation without providing it, as it's database-generated. This resolves a type error in mediaService.ts.
    created_at?: string;
}


// --- DASHBOARD ---
// FIX: Add ActivityItem type
export interface ActivityItem {
    id: string;
    type: 'order' | 'contact' | 'production';
    timestamp: string;
    title: string;
    description: string;
    value?: string;
    icon: React.ElementType;
}


// --- APP DATA ---
// FIX: Add AppData type
export interface AppData {
    catalogs: {
        paletas_cores: ColorPalette[];
        cores_texturas: {
            tecido: FabricColor[];
            ziper: ZipperColor[];
            vies: BiasColor[];
            forro: LiningColor[];
            puxador: PullerColor[];
            bordado: EmbroideryColor[];
            texturas: FabricTexture[];
        };
        fontes_monogramas: MonogramFont[];
    };
    logistica: {
        metodos_entrega: any[];
        calculo_frete: any[];
        tipos_embalagem: any[];
        tipos_vinculo: any[];
    };
    sistema: SystemSetting[];
    system_settings_logs: SystemSettingsLog[];
    config_supply_groups: MaterialGroup[];
    config_materials: Material[];
    warehouses: Warehouse[];
    mold_library: MoldLibrary[];
    production_routes: ProductionRoute[];
    media_assets: MediaAsset[];
    orders: Order[];
    order_items: OrderItem[];
    customers: Contact[];
    profiles: UserProfile[];
    products: Product[];
    product_variants: ProductVariant[];
    product_categories: ProductCategory[];
    collections: Collection[];
    production_orders: ProductionOrder[];
    production_tasks: ProductionTask[];
    production_quality_checks: ProductionQualityCheck[];
    task_statuses: TaskStatus[];
    tasks: Task[];
    omnichannel: {
        conversations: Conversation[];
        messages: Message[];
        quotes: Quote[];
    };
    logistics_waves: LogisticsWave[];
    logistics_shipments: LogisticsShipment[];
    logistics_pick_tasks: LogisticsPickTask[];
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
    analytics_login_events: any[];
    finance_accounts: FinanceAccount[];
    finance_categories: FinanceCategory[];
    finance_transactions: FinanceTransaction[];
    finance_payables: FinancePayable[];
    finance_receivables: FinanceReceivable[];
    config_integrations: Integration[];
    integration_logs: IntegrationLog[];
    initializer_agents: InitializerAgent[];
    initializer_logs: InitializerLog[];
    initializer_sync_state: InitializerSyncState[];
    workflow_rules: WorkflowRule[];
    notifications: Notification[];
    system_audit: SystemAudit[];
    production_audit: ProductionAudit[];
    governance_suggestions: GovernanceSuggestion[];
}