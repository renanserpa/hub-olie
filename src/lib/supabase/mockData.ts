import { Customer, InventoryItem, InventoryMovement, Order, OrderItem, ProductionOrder } from '../../types';

const organizationId = 'org-001';

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    organization_id: organizationId,
    customer_id: 'cust-001',
    customer: {
      id: 'cust-001',
      organization_id: organizationId,
      name: 'Empresa Exemplo',
      email: 'contato@exemplo.com',
      phone: '+55 11 99999-9999',
      created_at: new Date().toISOString(),
    },
    status: 'confirmed',
    total_gross_amount: 12800,
    total_net_amount: 12800,
    order_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    items: [
      {
        id: 'item-001',
        order_id: 'order-001',
        product_name: 'Produto A',
        quantity: 10,
        unit_price: 1200,
      },
    ],
  },
  {
    id: 'order-002',
    organization_id: organizationId,
    customer_id: 'cust-002',
    customer: {
      id: 'cust-002',
      organization_id: organizationId,
      name: 'Cliente Beta',
      email: 'beta@cliente.com',
      phone: '+55 21 98888-8888',
      created_at: new Date().toISOString(),
    },
    status: 'draft',
    total_gross_amount: 3200,
    total_net_amount: 3200,
    order_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  },
];

export const mockOrderItems: OrderItem[] = mockOrders.flatMap((order) => order.items || []);

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    organization_id: organizationId,
    name: 'Empresa Exemplo',
    email: 'contato@exemplo.com',
    phone: '+55 11 99999-9999',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cust-002',
    organization_id: organizationId,
    name: 'Cliente Beta',
    email: 'beta@cliente.com',
    phone: '+55 21 98888-8888',
    created_at: new Date().toISOString(),
  },
];

export const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'prod-001',
    organization_id: organizationId,
    reference: 'OP-2024-001',
    status: 'in_progress',
    planned_start: new Date().toISOString(),
    planned_end: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'prod-002',
    organization_id: organizationId,
    reference: 'OP-2024-002',
    status: 'planned',
    planned_start: new Date().toISOString(),
  },
];

export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'item-1',
    organization_id: organizationId,
    name: 'Matéria Prima A',
    sku: 'MP-A',
    quantity: 120,
  },
  {
    id: 'item-2',
    organization_id: organizationId,
    name: 'Produto Acabado B',
    sku: 'PA-B',
    quantity: 42,
  },
];

export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    organization_id: organizationId,
    item_id: 'item-1',
    type: 'in',
    quantity: 30,
    created_at: new Date().toISOString(),
    note: 'Reposição semanal',
  },
  {
    id: 'mov-2',
    organization_id: organizationId,
    item_id: 'item-2',
    type: 'out',
    quantity: 5,
    created_at: new Date().toISOString(),
    note: 'Venda',
  },
];

export const defaultOrganizationId = organizationId;
