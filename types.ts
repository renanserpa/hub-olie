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


// --- PRODUCTS & CATALOG (NEW ARCHITECTURE) ---

export type ProductStatus = 'Rascunho' | 'Homologado Qualidade' | 'Ativo' | 'Suspenso' | 'Descontinuado';

export interface ProductSize {
  id: string;
  name: string; // e.g., 'P', 'M', 'G'
  dimensions?: { width: number; height: number; depth: number };
}

export interface ProductPart {
  id: string;
  key: string; // e.g., 'tecido_principal', 'forro', 'ziper'
  name: string; // e.g., 'Tecido Principal', 'Forro', 'Zíper'
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

// FIX: Added ProductAttributes for the deprecated ProductConfigurator component.
export interface ProductAttributes {
  external_fabric_color_ids?: string[];
  internal_lining_color_ids?: string[];
  zipper_color_ids?: string[];
  bias_color_ids?: string[];
  puller_color_ids?: string[];
  embroidery?: boolean;
}

// Product is now conceptually ProductBase
export interface Product {
    id: string;
    name: string; // e.g., 'Bolsa Celine', 'Nécessaire Paris'
    description?: string;
    base_sku: string; // Base for generating variant SKUs
    base_price: number;
    category: string;
    status: ProductStatus;
    collection_ids?: string[];
    images: string[];
    createdAt: string;
    updatedAt: string;
    
    // New architecture fields
    available_sizes?: ProductSize[];
    configurable_parts?: ProductPart[];
    combination_rules?: CombinationRule[];
    base_bom?: BOMComponent[];

    // FIX: Added for compatibility with deprecated ProductConfigurator component and useColorLab hook.
    attributes?: ProductAttributes;
    hasVariants?: boolean;
}

export interface ProductVariant {
  id: string;
  product_base_id: string;
  sku: string; // Final, unique SKU
  name: string; // Generated name, e.g., "Bolsa Celine M - Linho Bege"
  configuration: Record<string, string>; // { size: 'size_id', tecido_principal: 'color_id', ... }
  price_modifier: number; // Price difference from base price
  final_price: number;
  dimensions?: { width: number; height: number; depth: number };
  bom: BOMComponent[];
  stock_quantity?: number;
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
  variant_sku?: string; // Reference the final SKU
  product_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
  config_json?: ConfigJson | Record<string, string>;
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
  production_order_id: