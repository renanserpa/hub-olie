import { runtime } from '../lib/runtime';
import { sandboxDb as sandboxService } from './sandboxDb';
import { supabaseService as realSupabaseService } from './supabaseService';
import { Order, Contact, Product, AnyProduct, ProductionOrder, ProductionOrderStatus, Task, TaskStatus, InventoryBalance, InventoryMovement, ProductCategory, SystemSetting, AnySettingsItem, SettingsCategory, OrderStatus, LogisticsWave, LogisticsShipment, MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem, AnalyticsKPI, Material, MaterialGroup, Notification, Warehouse, ProductionRoute, MoldLibrary, UserProfile } from '../types';

/**
 * This Data Service acts as a facade, routing all data operations
 * to the appropriate service based on the current runtime mode.
 * - In 'SANDBOX' mode, it uses the in-memory sandboxDb.
 * - In 'SUPABASE' mode, it uses the live supabaseService.
 *
 * All application hooks and components should use this service exclusively
 * for data access, ensuring a clean separation of concerns.
 */
export const dataService = runtime.mode === 'SANDBOX' ? sandboxService : realSupabaseService;