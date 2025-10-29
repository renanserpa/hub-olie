







// FIX: Added ContactAddress interface to be used in the Contact type.
export interface ContactAddress {
    zip?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}

export interface User {
  uid: string;
  email: string;
  role: 'AdminGeral' | 'Administrativo' | 'Producao' | 'Vendas' | 'Financeiro' | 'Conteudo';
}

export interface BaseItem {
  id: string;
  name: string;
}

// --- Settings Module Types ---

// 1. Catálogos
export interface ColorPalette extends BaseItem {
  descricao?: string;
  is_active: boolean;
}

interface BaseColor extends BaseItem {
  hex: string;
  cmyk?: string;
  palette_id: string;
  is_active: boolean;
}
export type FabricColor = BaseColor;
export type ZipperColor = BaseColor;
export type LiningColor = BaseColor;
export type PullerColor = BaseColor;
export type BiasColor = BaseColor;

export interface EmbroideryColor extends BaseColor {
  thread_type: 'rayon' | 'polyester' | 'cotton' | 'metallic';
  price_per_meter?: number;
}

export interface FabricTexture extends BaseItem {
  thumbnail_url: string;
  tile_url: string;
  composition?: string;
  care_instructions?: string;
  texture_type?: 'listrado' | 'xadrez' | 'poa' | 'floral';
  is_active: boolean;
}

export interface MonogramFont extends BaseItem {
    style: 'regular' | 'bold' | 'italic' | 'script';
    category: 'script' | 'serif' | 'sans-serif' | 'decorative' | 'handwritten';
    preview_url: string;
    font_file_url: string;
    is_active: boolean;
}

export interface CoresTexturasData {
    tecido: FabricColor[];
    ziper: ZipperColor[];
    forro: LiningColor[];
    puxador: PullerColor[];
    vies: BiasColor[];
    bordado: EmbroideryColor[];
    texturas: FabricTexture[];
}

export interface CatalogData {
    paletas_cores: ColorPalette[];
    cores_texturas: CoresTexturasData;
    fontes_monogramas: MonogramFont[];
}

// 2. Materiais
export interface SupplyGroup extends BaseItem {
    codigo: string;
    descricao?: string;
    is_active: boolean;
}
export interface BasicMaterial extends BaseItem {
    codigo: string;
    supply_group_id: string;
    unit: 'm' | 'kg' | 'un';
    default_cost?: number;
    metadata?: Record<string, any>;
    is_active: boolean;
}
export interface MaterialData {
    grupos_suprimento: SupplyGroup[];
    materiais_basicos: BasicMaterial[];
}

// 3. Logística
export interface DeliveryMethod extends BaseItem {
    type: 'correios' | 'motoboy' | 'retirada';
    enabled: boolean;
    notes?: string;
}
export interface FreightParams {
    id: 'main'; // Singleton
    radius_km: number;
    base_fee: number;
    fee_per_km: number;
    free_shipping_threshold: number;
}
export interface PackagingType extends BaseItem {
    codigo: string;
    material: 'papelão' | 'plástico';
    capacity?: string;
    weight_limit_g: number;
    dimensions_json: string; // "{"w":10, "h":10, "d":10}"
}
export interface BondType extends BaseItem {
    codigo: string;
    payroll_effects_json: string; // "{}"
}
export interface LogisticaData {
    metodos_entrega: DeliveryMethod[];
    calculo_frete: FreightParams[];
    tipos_embalagem: PackagingType[];
    tipos_vinculo: BondType[];
}

// 4. Sistema
export interface SystemSetting {
  id: string; 
  key: string; // Renamed from name to key
  value: string; // Stored as JSON string
  category: string;
  description: string;
}

// Union type for all possible setting items
export type AnySettingsItem = 
    | ColorPalette | FabricColor | ZipperColor | LiningColor | PullerColor | BiasColor | EmbroideryColor | FabricTexture | MonogramFont
    | SupplyGroup | BasicMaterial
    | DeliveryMethod | FreightParams | PackagingType | BondType
    | SystemSetting;


// --- Products Module Types ---
export interface ProductCategory extends BaseItem {
  description?: string;
}

export interface Product extends BaseItem {
  base_sku: string;
  base_price: number;
  category?: string; // Corrected: This is a text field, not a relation.
  stock_quantity: number;
  hasVariants: boolean;
  attributes?: {
    fabricColor?: string[]; // IDs from FabricColor
    zipperColor?: string[]; // IDs from ZipperColor
    liningColor?: string[]; // IDs from LiningColor
    biasColor?: string[]; // IDs from BiasColor
    embroidery?: boolean;
  };
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export type AnyProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;


// --- Orders Module Types (v3 Consolidated) ---

export type OrderStatus = 'pending_payment' | 'paid' | 'in_production' | 'awaiting_shipping' | 'shipped' | 'delivered' | 'cancelled';

export interface ConfigJson {
  // Legacy fields
  color?: string;
  material?: string;
  text?: string;
  width?: number;
  height?: number;
  notes?: string;
  
  // New structured personalization fields
  fabricColor?: string; // Hex code or name
  zipperColor?: string;
  biasColor?: string;
  liningColor?: string;
  embroidery?: {
    enabled: boolean;
    text: string;
    font: string; // font id
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  config_json?: ConfigJson;
  product?: Product;
}

// v1 Integration Data (stored in JSONB fields)
export interface PaymentDetails { status: 'pending' | 'paid' | 'failed'; method: string; checkoutUrl?: string; transactionId?: string; }
export interface FiscalDetails { status: 'pending' | 'authorized' | 'rejected'; nfeNumber?: string; serie?: string; pdfUrl?: string; xmlUrl?: string; }
export interface LogisticsDetails { status: 'pending' | 'in_transit' | 'shipped' | 'delivered'; carrier: string; service: string; tracking?: string; labelUrl?: string; }

// v2 Normalized Data (stored in separate tables)
export interface OrderPayment {
    id: string;
    order_id: string;
    amount: number;
    method: 'pix' | 'credit_card' | 'boleto' | 'link';
    status: 'pending' | 'completed' | 'failed';
    transaction_id?: string;
    gateway_response?: Record<string, any>;
    paid_at?: string;
}

export interface OrderTimelineEvent {
    id: string;
    order_id: string;
    event_type: 'status_change' | 'payment' | 'note' | 'integration' | 'creation';
    description: string;
    metadata?: Record<string, any>;
    created_by?: string; // User ID
    created_at: string;
}

export interface OrderNote {
    id: string;
    order_id: string;
    content: string;
    is_pinned: boolean;
    created_by: string; // User ID
    created_at: string;
}

// Consolidated Order type for v3
export interface Order { 
  id: string; 
  number: string; 
  customer_id: string; 
  customers?: Contact; // Joined data from 'customers' table
  status: OrderStatus; 
  
  // v2 Normalized Data
  items: OrderItem[]; 
  payments_history: OrderPayment[]; // from order_payments table
  timeline: OrderTimelineEvent[]; // from order_timeline table
  notes_internal: OrderNote[]; // from order_notes table
  
  subtotal: number; 
  discounts: number; 
  shipping_fee: number; 
  total: number; 
  
  // v1 Integration Data (JSONB) - acts as a cache/summary
  payments?: PaymentDetails; 
  fiscal?: FiscalDetails; 
  logistics?: LogisticsDetails; 
  
  notes?: string; // General notes field
  origin?: 'manual' | 'catalog' | 'whatsapp' | 'admin'; 
  created_at: string; 
  updated_at: string; 
}


// --- Contacts Module Types ---
// FIX: Updated Contact interface to match usage in components, adding address, phone, whatsapp, etc.
export interface Contact extends BaseItem {
  document: string; // Formerly cpf_cnpj
  email: string;
  phones: any; // jsonb, can be an array of {type, number} or simple object
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  birth_date?: string;
  address?: ContactAddress;
  tags?: string[];
  status?: string;
  metadata?: any;
}
export type AnyContact = Omit<Contact, 'id'>;


// --- Production Module Types ---
export type ProductionOrderStatus = 'novo' | 'planejado' | 'em_andamento' | 'em_espera' | 'finalizado' | 'cancelado';

export interface ProductionOrder {
  id: string;
  po_number: string; // ex: "OP-2024-001"
  product_id: string;
  product?: Product; // For joined data
  variant_id?: string;
  quantity: number;
  status: ProductionOrderStatus;
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  due_date: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // For progress bar
  steps_completed: number;
  steps_total: number;
}

export interface TaskStatus extends BaseItem {
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

// --- Omnichannel Module Types ---
export type Channel = 'whatsapp' | 'instagram' | 'site';
export type ConversationStatus = 'open' | 'pending' | 'waiting_customer' | 'waiting_internal' | 'closed';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageDirection = 'in' | 'out' | 'note';
export type MessageType = 'text' | 'image' | 'file' | 'quote' | 'test_preview';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected';


export interface Conversation {
  id: string;
  channel: Channel;
  customerId: string;
  customerHandle: string;
  customerName: string;
  customerAvatar?: string;
  title: string;
  status: ConversationStatus;
  priority: Priority;
  assigneeId?: string;
  assigneeName?: string;
  tags: string[];
  slaDueAt?: string;
  lastMessageAt: string;
  unreadCount: number;
  quoteId?: string;
  testConfigId?: string;
  closedAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  meta?: Record<string, any>;
  status: MessageStatus;
  authorId?: string;
  authorName?: string;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  config?: ConfigJson;
}

export interface Quote {
  id: string;
  conversationId: string;
  customerId: string;
  status: QuoteStatus;
  items: QuoteItem[];
  shipping: {
    method: string;
    cost: number;
    estimatedDelivery: string;
  };
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    grandTotal: number;
  };
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface OmnichannelData {
    conversations: Conversation[];
    messages: Message[];
    quotes: Quote[];
}

// --- Inventory Module Types ---
export interface InventoryBalance {
  material_id: string;
  material?: BasicMaterial; // Joined data
  quantity_on_hand: number;
  quantity_reserved: number;
  location?: string;
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
  reference_id?: string; // e.g., PO number or Production Order number
  notes?: string;
  created_at: string;
}


// --- Main Data Structure ---
export interface AppData {
  catalogs: CatalogData;
  materials: MaterialData;
  logistica: LogisticaData;
  sistema: SystemSetting[];
  midia: {}; // Placeholder for Media Library
  // Data for Orders module
  orders: Order[];
  contacts: Contact[];
  // Data for Products module
  products: Product[];
  product_categories: ProductCategory[];
  // Data for Production module
  production_orders: ProductionOrder[];
  task_statuses: TaskStatus[];
  tasks: Task[];
  // Data for Omnichannel module
  omnichannel: OmnichannelData;
  // Data for Inventory module
  inventory_balances: InventoryBalance[];
  inventory_movements: InventoryMovement[];
};

export type SettingsCategory = keyof Omit<AppData, 'orders' | 'contacts' | 'products' | 'product_categories' | 'production_orders' | 'task_statuses' | 'tasks' | 'omnichannel' | 'inventory_balances' | 'inventory_movements'>;


export type FieldConfig = {
    key: string;
    label: string;
    type: 'text' | 'color' | 'checkbox' | 'textarea' | 'number' | 'select' | 'date' | 'multiselect' | 'file';
    options?: { value: string; label: string }[];
};