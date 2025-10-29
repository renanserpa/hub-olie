import { isSandbox } from '../lib/runtime';
import { sandboxService } from './sandboxDb';
import { supabaseService as realSupabaseService } from './supabaseService';
import { Order, Contact, Product, AnyProduct, ProductionOrder, Task, TaskStatus, InventoryBalance, InventoryMovement, BasicMaterial } from '../types';

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
  
  updateDocument: <T>(table: string, id: string, docData: Partial<T>) =>
    isSandbox() ? sandboxService.updateDocument(table, id, docData) : realSupabaseService.updateDocument(table, id, docData),

  addDocument: <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>) =>
    isSandbox() ? sandboxService.addDocument(table, docData) : realSupabaseService.addDocument(table, docData),

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

  getOrders: () => 
    isSandbox() ? sandboxService.getOrders() : realSupabaseService.getOrders(),

  getOrder: (id: string) => 
    isSandbox() ? sandboxService.getOrder(id) : realSupabaseService.getOrder(id),

  addOrder: (orderData: Partial<Order>) => 
    isSandbox() ? sandboxService.addOrder(orderData) : realSupabaseService.addOrder(orderData),

  getProductionOrders: () => 
    isSandbox() ? sandboxService.getProductionOrders() : realSupabaseService.getProductionOrders(),

  getTasks: () => 
    isSandbox() ? sandboxService.getTasks() : realSupabaseService.getTasks(),

  getTaskStatuses: () => 
    isSandbox() ? sandboxService.getTaskStatuses() : realSupabaseService.getTaskStatuses(),
    
  getInventoryBalances: () => 
    isSandbox() ? sandboxService.getInventoryBalances() : realSupabaseService.getInventoryBalances(),

  getInventoryMovements: (materialId: string) => 
    isSandbox() ? sandboxService.getInventoryMovements(materialId) : realSupabaseService.getInventoryMovements(materialId),
  
  getProducts: () => 
    isSandbox() ? sandboxService.getProducts() : realSupabaseService.getProducts(),

  getProductCategories: () => 
    isSandbox() ? sandboxService.getProductCategories() : realSupabaseService.getProductCategories(),

  getContacts: () => 
    isSandbox() ? sandboxService.getContacts() : realSupabaseService.getContacts(),
};
