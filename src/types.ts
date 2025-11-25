export type UUID = string;

export interface User {
  id: UUID;
  email: string;
  name?: string;
}

export interface Organization {
  id: UUID;
  name: string;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: UUID;
  organization_id: UUID;
  customer_id?: UUID | null;
  customer?: Customer | null;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled';
  order_date?: string | null;
  due_date?: string | null;
  total_gross_amount: number;
  total_net_amount: number;
  notes?: string | null;
  code?: string | null;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface Customer {
  id: UUID;
  organization_id: UUID;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface ProductionOrder {
  id: UUID;
  organization_id: UUID;
  reference: string;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  planned_start: string;
  planned_end?: string;
}

export interface InventoryItem {
  id: UUID;
  organization_id: UUID;
  name: string;
  sku: string;
  quantity: number;
}

export interface InventoryMovement {
  id: UUID;
  organization_id: UUID;
  item_id: UUID;
  type: 'in' | 'out';
  quantity: number;
  created_at: string;
  note?: string;
}
