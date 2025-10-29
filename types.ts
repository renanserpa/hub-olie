// types.ts

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
}


// --- CONTACTS ---

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
}
export type AnyContact = Omit<Contact, 'id'>;


// --- PRODUCTS & CATALOG ---

export interface ProductAttributes {
  fabricColor?: string[];
  zipperColor?: string[];
  embroidery?: boolean;
  [key: string]: any;
}

export interface Product {
    id: string;
    name: string;
    base_sku: string;
    base_price: number;
    category: string;
    stock_quantity: number;
    hasVariants: boolean;
    attributes?: ProductAttributes;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export type AnyProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
}

export interface ConfigJson {
  fabricColor?: string;
  zipperColor?: string;
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

// --- PRODUCTION ---
export type ProductionOrderStatus = 'novo' | 'planejado' | 'em_andamento' | 'em_espera' | 'finalizado' | 'cancelado';
export type ProductionOrderPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface ProductionOrder {
    id: string;
    po_number: string;
    product_id: string;
    product?: Product;
    quantity: number;
    status: ProductionOrderStatus;
    priority: ProductionOrderPriority;
    due_date: string;
    steps_completed: number;
    steps_total: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
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
}

// --- INVENTORY ---

export interface BasicMaterial { id: string; codigo: string; name: string; supply_group_id: string; unit: string; default_cost: number; is_active: boolean; }
export interface SupplyGroup { id: string; codigo: string; name: string; is_active: boolean; }

export interface InventoryBalance {
    material_id: string;
    material?: BasicMaterial;
    quantity_on_hand: number;
    quantity_reserved: number;
    low_stock_threshold: number;
    last_updated_at: string;
}

export type InventoryMovementType = 'in' | 'out' | 'adjustment';
export type InventoryMovementReason = 'compra' | 'consumo_producao' | 'venda' | 'contagem' | 'devolucao' | 'perda';

export interface InventoryMovement {
    id: string;
    material_id: string;
    type: InventoryMovementType;
    quantity: number;
    reason: InventoryMovementReason;
    reference_id?: string;
    notes?: string;
    created_at: string;
}

// --- SETTINGS ---
export type SettingsCategory = 'integrations' | 'catalogs' | 'materials' | 'system' | 'appearance' | 'security';

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
export interface FabricTexture { id: string; name: string; description?: string; image_url?: string; is_active: boolean; }
export interface MonogramFont { id: string; name: string; style: string; category: string; preview_url: string; font_file_url: string; is_active: boolean; }

export interface DeliveryMethod { id: string; name: string; description?: string; is_active: boolean; }
export interface FreightParams { id: string; name: string; value: string; }
export interface PackagingType { id: string; name: string; length: number; width: number; height: number; weight: number; }
export interface BondType { id: string; name: string; description: string; }

export type AnySettingsItem =
  | ColorPalette | FabricColor | ZipperColor | LiningColor | PullerColor | BiasColor
  | EmbroideryColor | FabricTexture | MonogramFont | SupplyGroup | BasicMaterial
  | DeliveryMethod | FreightParams | PackagingType | BondType;

export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    category: string;
    description: string;
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

export interface MarketingSegment {
    id: string;
    name: string;
    description: string;
    rule_count: number;
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
    material_name: string;
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
    materials: {
        grupos_suprimento: SupplyGroup[];
        materiais_basicos: BasicMaterial[];
    };
    logistica: {
        metodos_entrega: DeliveryMethod[];
        calculo_frete: FreightParams[];
        tipos_embalagem: PackagingType[];
        tipos_vinculo: BondType[];
    };
    sistema: SystemSetting[];
    
    midia: any;
    orders: Order[];
    contacts: Contact[];
    products: Product[];
    product_categories: ProductCategory[];
    production_orders: ProductionOrder[];
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
}