import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  defaultOrganizationId,
  mockCustomers,
  mockInventoryItems,
  mockInventoryMovements,
  mockOrderItems,
  mockOrders,
  mockProductionOrders,
} from './mockData';
import { Customer, InventoryItem, InventoryMovement, Order, OrderItem, ProductionOrder } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const mockFlag = import.meta.env.VITE_SUPABASE_MOCK === 'true';

export const isMock = mockFlag || !supabaseUrl || !supabaseAnonKey;

const realClient: SupabaseClient | null = !isMock && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabase: SupabaseClient =
  (realClient as SupabaseClient) ?? createClient('https://mock.supabase.local', 'mock');

export type TableName = 'orders' | 'order_items' | 'customers' | 'production_orders' | 'inventory_items' | 'inventory_movements';

interface MockResponse<T> {
  data: T[] | null;
  error: Error | null;
}

const filterByOrg = <T extends { organization_id: string }>(rows: T[], organizationId?: string) => {
  if (!organizationId) return rows;
  return rows.filter((row) => row.organization_id === organizationId);
};

export const fetchMockTable = async <T>(table: TableName, organization_id?: string): Promise<MockResponse<T>> => {
  switch (table) {
    case 'orders':
      return { data: filterByOrg(mockOrders, organization_id) as T[], error: null };
    case 'order_items':
      return { data: mockOrderItems as T[], error: null };
    case 'customers':
      return { data: filterByOrg(mockCustomers, organization_id) as T[], error: null };
    case 'production_orders':
      return { data: filterByOrg(mockProductionOrders, organization_id) as T[], error: null };
    case 'inventory_items':
      return { data: filterByOrg(mockInventoryItems, organization_id) as T[], error: null };
    case 'inventory_movements':
      return { data: filterByOrg(mockInventoryMovements, organization_id) as T[], error: null };
    default:
      return { data: null, error: new Error('Tabela não suportada no modo mock') };
  }
};

export const upsertMockOrder = async (order: Order): Promise<MockResponse<Order>> => {
  const existingIndex = mockOrders.findIndex((item) => item.id === order.id);
  if (existingIndex >= 0) {
    mockOrders[existingIndex] = order;
  } else {
    mockOrders.push(order);
  }
  return { data: [order], error: null };
};

export const deleteMockCustomer = async (customerId: string): Promise<MockResponse<Customer>> => {
  const index = mockCustomers.findIndex((c) => c.id === customerId);
  if (index >= 0) {
    const [removed] = mockCustomers.splice(index, 1);
    return { data: [removed as Customer], error: null };
  }
  return { data: null, error: new Error('Cliente não encontrado') };
};

export const createMockProductionOrder = async (order: ProductionOrder): Promise<MockResponse<ProductionOrder>> => {
  mockProductionOrders.push(order);
  return { data: [order], error: null };
};

export const mockOrganizationId = defaultOrganizationId;
