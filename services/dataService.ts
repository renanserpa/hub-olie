import { isSandbox } from '../lib/runtime';
import { sandboxDb as sandboxService } from './sandboxDb';
import { supabaseService as realSupabaseService } from './supabaseService';
import { Order, Contact, Product, AnyProduct, ProductionOrder, Task, TaskStatus, InventoryBalance, InventoryMovement, BasicMaterial, ProductCategory, SystemSetting, AnySettingsItem, SettingsCategory, OrderStatus, LogisticsWave, LogisticsShipment, MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem, AnalyticsKPI } from '../types';

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