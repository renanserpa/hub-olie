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
  customer_name: string;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled';
  total: number;
  created_at: string;
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
  code: string;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  priority: number;
  order_id?: UUID;
  planned_start_date: string;
  planned_end_date?: string;
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
