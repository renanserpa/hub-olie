import { isSandbox } from '../lib/runtime';
import { sandboxService } from './sandboxDb';
import { supabaseService as realSupabaseService } from './supabaseService';
import { Order, Contact, Product, AnyProduct, ProductionOrder, Task, TaskStatus, InventoryBalance, InventoryMovement, BasicMaterial, ProductCategory, SystemSetting, AnySettingsItem, SettingsCategory, OrderStatus, LogisticsWave, LogisticsShipment, MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem } from '../types';

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

  listenToDocument: <T>(table: string, id: string, callback: (payload: T) => void) =>
    isSandbox()
      ? sandboxService.listenToDocument(table, id, callback)
      : realSupabaseService.listenToDocument(table, id, callback),

  // App-specific
  getSettings: () => 
    isSandbox() ? sandboxService.getSettings() : realSupabaseService.getSettings(),

  addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) =>
    isSandbox()
      ? Promise.reject("addSetting not implemented in sandbox")
      : realSupabaseService.addSetting(category, data, subTab, subSubTab),

  updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) =>
    isSandbox()
      ? Promise.reject("updateSetting not implemented in sandbox")
      : realSupabaseService.updateSetting(category, id, data, subTab, subSubTab),
      
  deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) =>
    isSandbox()
        ? Promise.reject("deleteSetting not implemented in sandbox")
        : realSupabaseService.deleteSetting(category, id, subTab, subSubTab),
        
  updateSystemSettings: (settings: SystemSetting[]) =>
    isSandbox()
      ? Promise.all(settings.map(s => sandboxService.updateDocument('system_settings', s.id, s)))
      : realSupabaseService.updateSystemSettings(settings),

  getOrders: () => 
    isSandbox() ? sandboxService.getOrders() : realSupabaseService.getOrders(),

  getOrder: (id: string) => 
    isSandbox() ? sandboxService.getOrder(id) : realSupabaseService.getOrder(id),

  addOrder: (orderData: Partial<Order>) => 
    isSandbox() ? sandboxService.addOrder(orderData) : realSupabaseService.addOrder(orderData),

  updateOrder: (orderId: string, data: Partial<Order>) =>
    isSandbox() ? sandboxService.updateDocument('orders', orderId, data) : realSupabaseService.updateOrder(orderId, data),
    
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) =>
    isSandbox() ? sandboxService.updateDocument<Order>('orders', orderId, { status: newStatus }) : realSupabaseService.updateOrderStatus(orderId, newStatus),

  getProductionOrders: () => 
    isSandbox() ? sandboxService.getProductionOrders() : realSupabaseService.getProductionOrders(),

  getTasks: () => 
    isSandbox() ? sandboxService.getTasks() : realSupabaseService.getTasks(),

  getTaskStatuses: () => 
    isSandbox() ? sandboxService.getTaskStatuses() : realSupabaseService.getTaskStatuses(),
    
  updateTask: (taskId: string, data: Partial<Task>) =>
    isSandbox() ? sandboxService.updateDocument('tasks', taskId, data) : realSupabaseService.updateTask(taskId, data),

  getInventoryBalances: () => 
    isSandbox() ? sandboxService.getInventoryBalances() : realSupabaseService.getInventoryBalances(),

  getInventoryMovements: (materialId: string) => 
    isSandbox() ? sandboxService.getInventoryMovements(materialId) : realSupabaseService.getInventoryMovements(materialId),

  addInventoryMovement: (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) =>
    // FIX: The sandbox `addDocument` expects a `created_at` property, which `movementData` lacks. This aligns the sandbox call with the expected type.
    isSandbox() ? sandboxService.addDocument('inventory_movements', { ...movementData, created_at: new Date().toISOString() }) : realSupabaseService.addInventoryMovement(movementData),
  
  getProducts: () => 
    isSandbox() ? sandboxService.getProducts() : realSupabaseService.getProducts(),

  getProductCategories: () => 
    isSandbox() ? sandboxService.getProductCategories() : realSupabaseService.getProductCategories(),

  addProduct: (productData: AnyProduct) =>
    isSandbox() ? sandboxService.addDocument('products', productData) : realSupabaseService.addProduct(productData),
    
  updateProduct: (productId: string, productData: Product | AnyProduct) =>
    // FIX: Explicitly pass the generic type to `updateDocument` for the sandbox case to fix type error.
    isSandbox() ? sandboxService.updateDocument<Product>('products', productId, productData) : realSupabaseService.updateProduct(productId, productData),

  getContacts: () => 
    isSandbox() ? sandboxService.getContacts() : realSupabaseService.getContacts(),
    
  // FIX: Exposed getLogisticsData through the data service facade to fix error in useLogistics hook.
  getLogisticsData: (): Promise<{ orders: Order[], waves: LogisticsWave[], shipments: LogisticsShipment[] }> =>
    isSandbox() ? sandboxService.getLogisticsData() : realSupabaseService.getLogisticsData(),

  // Marketing
  getMarketingCampaigns: (): Promise<MarketingCampaign[]> =>
    isSandbox() ? sandboxService.getCollection('marketing_campaigns') : realSupabaseService.getCollection('marketing_campaigns'),
  getMarketingSegments: (): Promise<MarketingSegment[]> =>
    isSandbox() ? sandboxService.getCollection('marketing_segments') : realSupabaseService.getCollection('marketing_segments'),
  getMarketingTemplates: (): Promise<MarketingTemplate[]> =>
    isSandbox() ? sandboxService.getCollection('marketing_templates') : realSupabaseService.getCollection('marketing_templates'),

  // Purchasing
  getPurchasingData: (): Promise<{ suppliers: Supplier[], purchase_orders: PurchaseOrder[], purchase_order_items: PurchaseOrderItem[] }> =>
    isSandbox() ? sandboxService.getPurchasingData() : realSupabaseService.getPurchasingData(),
};