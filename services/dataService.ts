import { isSandbox } from '../lib/runtime';
import { sandboxDb as sandboxService } from './sandboxDb';
import { supabaseService as realSupabaseService } from './supabaseService';
import { Order, Contact, Product, AnyProduct, ProductionOrder, Task, TaskStatus, InventoryBalance, InventoryMovement, ProductCategory, SystemSetting, AnySettingsItem, SettingsCategory, OrderStatus, LogisticsWave, LogisticsShipment, MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem, AnalyticsKPI, Material, MaterialGroup, Notification, Warehouse } from '../types';

/**
 * This Data Service acts as a facade, routing all data operations
 * to the appropriate service based on the current runtime mode.
 * - In 'SANDBOX' mode, it uses the in-memory sandboxDb.
 * - In 'SUPABASE' mode, it uses the live supabaseService.
 *
 * All application hooks and components should use this service exclusively
 * for data access, ensuring a clean separation of concerns.
 */
export const dataService = {
  // Generic
  getCollection: <T>(table: string, join?: string) => 
    isSandbox() ? sandboxService.getCollection<T>(table) : realSupabaseService.getCollection<T>(table, join),
  
  getDocument: <T>(table: string, id: string) =>
    isSandbox() ? sandboxService.getDocument<T>(table, id) : realSupabaseService.getDocument<T>(table, id),

  updateDocument: <T extends {id: string}>(table: string, id: string, docData: Partial<T>) =>
    isSandbox() ? sandboxService.updateDocument(table, id, docData) : realSupabaseService.updateDocument(table, id, docData),

  addDocument: <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>) =>
    isSandbox() ? sandboxService.addDocument(table, docData) : realSupabaseService.addDocument(table, docData),
  
  deleteDocument: (table: string, id: string) =>
    isSandbox() ? sandboxService.deleteDocument(table, id) : realSupabaseService.deleteDocument(table, id),

  // Listeners
  listenToCollection: <T>(table: string, join: string | undefined, callback: (payload: T[]) => void) =>
    isSandbox()
      ? sandboxService.listenToCollection(table, callback)
      : realSupabaseService.listenToCollection(table, join, callback),

  listenToDocument: <T extends { id: string }>(table: string, id: string, callback: (payload: T) => void) =>
    isSandbox()
      ? sandboxService.listenToDocument(table, id, callback)
      : realSupabaseService.listenToDocument(table, id, callback),
  
  testIntegrationConnection: (integrationId: string) =>
    isSandbox()
      ? sandboxService.testIntegrationConnection(integrationId)
      : Promise.resolve(), // In a real app, this would be a Supabase RPC call

  // App-specific
  getSettings: () => 
    isSandbox() ? sandboxService.getSettings() : realSupabaseService.getSettings(),

  addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) =>
    isSandbox()
      ? sandboxService.addSetting(category, data, subTab, subSubTab)
      : realSupabaseService.addSetting(category, data, subTab, subSubTab),

  updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) =>
    isSandbox()
      ? sandboxService.updateSetting(category, id, data, subTab, subSubTab)
      : realSupabaseService.updateSetting(category, id, data, subTab, subSubTab),
      
  deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) =>
    isSandbox()
        ? sandboxService.deleteSetting(category, id, subTab, subSubTab)
        : realSupabaseService.deleteSetting(category, id, subTab, subSubTab),
  
  updateSystemSettings: (settings: SystemSetting[]) =>
    isSandbox()
        ? sandboxService.updateSystemSettings(settings)
        : realSupabaseService.updateSystemSettings(settings),

  getSystemSettingsLogs: () =>
    isSandbox()
        ? sandboxService.getCollection('system_settings_logs')
        : realSupabaseService.getCollection('system_settings_logs'),

  updateSystemSetting: (key: string, newValue: any, source: string, confidence: number, explanation: string) =>
    isSandbox()
        ? sandboxService.updateSystemSetting(key, newValue, source, confidence, explanation)
        : Promise.resolve(), // In real mode, this would be an RPC call or complex transaction.

  // Materials
  getMaterials: (): Promise<Material[]> => isSandbox() ? sandboxService.getMaterials() : realSupabaseService.getMaterials(),
  getMaterialGroups: (): Promise<MaterialGroup[]> => isSandbox() ? sandboxService.getMaterialGroups() : realSupabaseService.getMaterialGroups(),
  addMaterial: (material: any): Promise<Material> => isSandbox() ? sandboxService.addMaterial(material) : realSupabaseService.addDocument('config_materials', material),
  addMaterialGroup: (group: any): Promise<MaterialGroup> => isSandbox() ? sandboxService.addMaterialGroup(group) : realSupabaseService.addDocument('config_supply_groups', group),
  
  getOrders: () => isSandbox() ? sandboxService.getOrders() : realSupabaseService.getOrders(),
  getOrder: (id: string) => isSandbox() ? sandboxService.getOrder(id) : realSupabaseService.getOrder(id),
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => isSandbox() ? sandboxService.updateOrderStatus(orderId, newStatus) : realSupabaseService.updateOrderStatus(orderId, newStatus),
  addOrder: (orderData: Partial<Order>) => isSandbox() ? sandboxService.addOrder(orderData) : realSupabaseService.addOrder(orderData),
  updateOrder: (orderId: string, data: Partial<Order>) => isSandbox() ? sandboxService.updateOrder(orderId, data) : realSupabaseService.updateOrder(orderId, data),

  getProductionOrders: () => isSandbox() ? sandboxService.getCollection<ProductionOrder>('production_orders') : realSupabaseService.getProductionOrders(),
  
  getTasks: () => isSandbox() ? sandboxService.getCollection<Task>('tasks') : realSupabaseService.getTasks(),
  getTaskStatuses: () => isSandbox() ? sandboxService.getCollection<TaskStatus>('task_statuses') : realSupabaseService.getTaskStatuses(),
  updateTask: (taskId: string, data: Partial<Task>) => isSandbox() ? sandboxService.updateDocument<Task>('tasks', taskId, data) : realSupabaseService.updateTask(taskId, data),

  getInventoryBalances: () => isSandbox() ? sandboxService.getCollection<InventoryBalance>('inventory_balances') : realSupabaseService.getInventoryBalances(),
  getInventoryMovements: (materialId: string) => isSandbox() ? sandboxService.getInventoryMovements(materialId) : realSupabaseService.getInventoryMovements(materialId),
  addInventoryMovement: (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => isSandbox() ? sandboxService.addInventoryMovement(movementData) : realSupabaseService.addInventoryMovement(movementData),
  // FIX: Added transferStock to the service to match its usage in useInventory hook.
  transferStock: (transferData: any) => isSandbox() ? sandboxService.transferStock(transferData) : realSupabaseService.transferStock(transferData),
  
  getProducts: () => isSandbox() ? sandboxService.getCollection<Product>('products') : realSupabaseService.getProducts(),
  getProductCategories: () => isSandbox() ? sandboxService.getCollection<ProductCategory>('product_categories') : realSupabaseService.getProductCategories(),
  
  getContacts: () => isSandbox() ? sandboxService.getCollection<Contact>('customers') : realSupabaseService.getContacts(),
  
  getWarehouses: (): Promise<Warehouse[]> => isSandbox() ? sandboxService.getCollection<Warehouse>('warehouses') : realSupabaseService.getCollection<Warehouse>('warehouses'),

  getLogisticsData: () => isSandbox() ? sandboxService.getLogisticsData() : realSupabaseService.getLogisticsData(),

  getMarketingCampaigns: () => isSandbox() ? sandboxService.getCollection<MarketingCampaign>('marketing_campaigns') : realSupabaseService.getMarketingCampaigns(),
  getMarketingSegments: () => isSandbox() ? sandboxService.getCollection<MarketingSegment>('marketing_segments') : realSupabaseService.getMarketingSegments(),
  getMarketingTemplates: () => isSandbox() ? sandboxService.getCollection<MarketingTemplate>('marketing_templates') : realSupabaseService.getMarketingTemplates(),

  getPurchasingData: () => isSandbox() ? sandboxService.getPurchasingData() : realSupabaseService.getPurchasingData(),
  createPO: (poData: { supplier_id: string; items: Omit<PurchaseOrderItem, 'id' | 'po_id'>[] }) =>
    isSandbox() ? sandboxService.createPO(poData) : realSupabaseService.createPO(poData as any), // Cast as any for supabase simplicity
  receivePOItems: (poId: string, receivedItems: { itemId: string; receivedQty: number }[]) =>
    isSandbox() ? sandboxService.receivePOItems(poId, receivedItems) : realSupabaseService.receivePOItems(poId, receivedItems),
  
  getAnalyticsKpis: () => isSandbox() ? sandboxService.getCollection<AnalyticsKPI>('analytics_kpis') : realSupabaseService.getAnalyticsKpis(),

  getFinanceData: () => isSandbox() ? sandboxService.getFinanceData() : realSupabaseService.getFinanceData(),

  getNotifications: (): Promise<Notification[]> => isSandbox() ? sandboxService.getCollection<Notification>('notifications') : realSupabaseService.getNotifications(),
  markNotificationAsRead: (id: string): Promise<Notification> => isSandbox() ? sandboxService.updateDocument<Notification>('notifications', id, { is_read: true }) : realSupabaseService.markNotificationAsRead(id),
};
