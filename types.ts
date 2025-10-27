

export interface User {
  uid: string;
  email: string;
  role: 'AdminGeral' | 'Administrativo' | 'Produção' | 'Vendas' | 'Financeiro' | 'Conteúdo';
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
}
export interface BasicMaterial extends BaseItem {
    codigo: string;
    supply_group_id: string;
    unit: 'm' | 'kg' | 'un';
    default_cost?: number;
    metadata?: Record<string, any>;
}
export interface MaterialData {
    grupos_suprimento: SupplyGroup[];
    materiais_basicos: BasicMaterial[];
}

// 3. Logística
export interface DeliveryMethod {
    id: string;
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
  name: string;
  value: string;
  category: string;
  description: string;
}

// Union type for all possible setting items
export type AnySettingsItem = 
    | ColorPalette | FabricColor | ZipperColor | LiningColor | PullerColor | BiasColor | EmbroideryColor | FabricTexture | MonogramFont
    | SupplyGroup | BasicMaterial
    | DeliveryMethod | FreightParams | PackagingType | BondType
    | SystemSetting;


// --- Orders Module Types (unchanged) ---

export type OrderStatus = 'pending_payment' | 'paid' | 'in_production' | 'awaiting_shipping' | 'shipped' | 'delivered' | 'cancelled';
export interface ConfigJson { color?: string; material?: string; text?: string; width?: number; height?: number; thickness?: number; notes?: string; }
export interface OrderItem { id: string; product_id: string; product_name: string; quantity: number; unit_price: number; total: number; config_json?: ConfigJson; }
export interface PaymentDetails { status: 'pending' | 'paid' | 'failed'; method: string; checkoutUrl?: string; transactionId?: string; }
export interface FiscalDetails { status: 'pending' | 'authorized' | 'rejected'; nfeNumber?: string; serie?: string; pdfUrl?: string; xmlUrl?: string; }
export interface LogisticsDetails { status: 'pending' | 'in_transit' | 'delivered'; carrier: string; service: string; tracking?: string; labelUrl?: string; }
export interface Order { id: string; order_number: string; contact_id: string; contact?: Contact; status: OrderStatus; items: OrderItem[]; subtotal: number; discount: number; shipping_cost: number; total: number; payments?: PaymentDetails; fiscal?: FiscalDetails; logistics?: LogisticsDetails; notes?: string; source?: 'manual' | 'catalog' | 'whatsapp'; created_at: string; updated_at: string; }
export interface Contact extends BaseItem { email: string; phone: string; address: { street: string; city: string; state: string; zip: string; }; }
export interface Product extends BaseItem { price: number; stock_quantity: number; }


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
  products: Product[];
};

export type SettingsCategory = keyof Omit<AppData, 'orders' | 'contacts' | 'products' | 'midia'>;


export type FieldConfig = {
    key: string;
    label: string;
    type: 'text' | 'color' | 'checkbox' | 'textarea' | 'number' | 'select';
    options?: { value: string; label: string }[];
};
