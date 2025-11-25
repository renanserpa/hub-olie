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
import { Customer, InventoryItem, InventoryMovement, Order, ProductionOrder } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Even in mock mode we instantiate a client with placeholder values to avoid null checks across the app
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://mock.supabase.local',
  supabaseAnonKey || 'mock-anon-key',
);

export type TableName =
  | 'orders'
  | 'order_items'
  | 'customers'
  | 'production_orders'
  | 'inventory_items'
  | 'inventory_movements';

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

export const upsertMockCustomer = async (customer: Customer): Promise<MockResponse<Customer>> => {
  const existingIndex = mockCustomers.findIndex((item) => item.id === customer.id);
  if (existingIndex >= 0) {
    mockCustomers[existingIndex] = customer;
  } else {
    mockCustomers.push(customer);
  }
  return { data: [customer], error: null };
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

export const updateMockProductionOrderStatus = async (
  id: string,
  status: ProductionOrder['status'],
): Promise<MockResponse<ProductionOrder>> => {
  const idx = mockProductionOrders.findIndex((item) => item.id === id);
  if (idx === -1) return { data: null, error: new Error('Ordem de produção não encontrada') };
  mockProductionOrders[idx] = { ...mockProductionOrders[idx], status };
  return { data: [mockProductionOrders[idx]], error: null };
};

export const mockOrganizationId = defaultOrganizationId;
