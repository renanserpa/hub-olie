// FIX: Added React import to resolve 'Cannot find namespace React' errors.
import React from 'react';
import { createClient } from "@supabase/supabase-js";
import {
    AppData,
    BiasColor,
    ColorPalette,
    Collection,
    Contact,
    EmbroideryColor,
    FabricColor,
    FabricTexture,
    InventoryBalance,
    InventoryMovement,
    LiningColor,
    MonogramFont,
    Order, OrderItem, OrderStatus,
    Product,
    ProductCategory,
    ProductionOrder,
    ProductionOrderStatus,
    ProductionQualityCheck,
    ProductionTask,
    PullerColor,
    SettingsCategory,
    SystemSetting,
    Task,
    TaskStatus,
    ZipperColor,
    LogisticsWave,
    LogisticsShipment,
    MarketingCampaign,
    MarketingSegment,
    MarketingTemplate,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    SystemSettingsLog,
    AnalyticsSnapshot,
    Integration,
    IntegrationLog,
    Material,
    MaterialGroup,
    InitializerAgent,
    InitializerLog,
    InitializerSyncState,
    WorkflowRule,
    Notification,
    SystemAudit,
    MoldLibrary,
    ProductionRoute,
    ProductVariant,
    UserProfile,
    AIInsight,
    Warehouse,
    MediaAsset,
    ExecutiveKPI,
    PurchaseOrderStatus,
    SystemSettingsHistory,
    SystemRole,
    SystemPermission,
    WebhookLog,
    LogisticsPickTask,
    GovernanceSuggestion,
} from "../types";

// FIX: Cast import.meta to any to avoid TypeScript errors on env property.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
    supabaseUrl || 'https://missing-url.supabase.co',
    supabaseAnonKey || 'missing-key',
    {
        auth: { 
            persistSession: true,
            autoRefreshToken: true,
        },
    }
);

// --- HELPER METHODS ---
const handleError = (error: any, context: string) => {
    if (error?.code === '42P01') {
        console.warn(`[Supabase] Tabela ausente detetada em "${context}". O sistema pode precisar de Bootstrap.`);
        return new Error(`Missing Table: ${context}`);
    }
    const errorMessage = error.message || 'An unknown error occurred';
    console.error(`Error in ${context}: ${errorMessage}`, error);
    throw new Error(`Supabase operation failed in ${context}: ${errorMessage}`);
};

// --- CORE SERVICE IMPLEMENTATION ---
export const supabaseService = {
  getCollection: async <T>(table: string, join?: string): Promise<T[]> => {
    try {
        const query = join ? supabase.from(table).select(join) : supabase.from(table).select('*');
        const { data, error } = await query;
        if (error) throw error;
        return (data as T[]) || [];
    } catch (error: any) {
        if (error?.code === '42P01') return [];
        throw error;
    }
  },

  getDocument: async <T>(table: string, id: string, join?: string): Promise<T | null> => {
    const query = join ? supabase.from(table).select(join) : supabase.from(table).select('*');
    const { data, error } = await query.eq('id', id).maybeSingle();
    if (error) handleError(error, `getDocument(${table}, ${id})`);
    return data as T | null;
  },

  addDocument: async <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>): Promise<T> => {
    const { data, error } = await supabase.from(table).insert(docData).select().single();
    if (error) handleError(error, `addDocument(${table})`);
    return data as T;
  },

  updateDocument: async <T extends { id: string }>(table: string, id: string, docData: Partial<T>): Promise<T> => {
    const { data, error } = await supabase.from(table).update(docData).eq('id', id).select().single();
    if (error) handleError(error, `updateDocument(${table}, ${id})`);
    return data as T;
  },

  deleteDocument: async (table: string, id: string): Promise<void> => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) handleError(error, `deleteDocument(${table}, ${id})`);
  },

  listenToCollection: <T extends { id: string }>(
    table: string, 
    join: string | undefined, 
    setData?: React.Dispatch<React.SetStateAction<T[]>>,
    // FIX: Added callback parameter to listenToCollection to fix 'Expected 2-3 arguments, but got 4' errors.
    callback?: (data: T[]) => void
  ) => {
      const fetchData = async () => {
          const data = await supabaseService.getCollection<T>(table, join);
          if (setData) setData(data);
          // FIX: Execute optional callback.
          if (callback) callback(data);
      };
      fetchData(); 

      const channel = supabase.channel(`public:${table}`);
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: table }, () => fetchData())
        .subscribe();

      return { unsubscribe: () => supabase.removeChannel(channel) };
  },

  getPermissions: (): Promise<SystemPermission[]> => supabaseService.getCollection('system_permissions'),
  
  getSettings: async (): Promise<AppData> => {
    // Implementação robusta que não quebra se as tabelas não existirem
    const [sistema, materials, categories, collections] = await Promise.all([
        supabaseService.getCollection<SystemSetting>('system_settings'),
        supabaseService.getCollection<Material>('config_materials'),
        supabaseService.getCollection<ProductCategory>('product_categories'),
        supabaseService.getCollection<Collection>('collections'),
    ]);
    
    return {
      sistema,
      config_materials: materials,
      product_categories: categories,
      collections,
      // ... outros campos inicializados como vazios para evitar undefined
    } as any;
  }
};