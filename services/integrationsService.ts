import { supabase } from '../lib/supabaseClient';
import { Order, PaymentDetails, FiscalDetails, LogisticsDetails } from "../types";

// Helper function to invoke Supabase Edge Functions
async function invokeEdgeFunction<T>(functionName: string, payload: any): Promise<T> {
  console.log(`📡 [integrationsService] Invoking Edge Function: ${functionName}`, payload);
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    console.error(`[integrationsService] Error invoking ${functionName}:`, error);
    throw new Error(`Failed to execute integration function ${functionName}: ${error.message}`);
  }

  return data;
}

export const integrationsService = {
  generatePaymentLink: async (order: Order): Promise<{ payments: PaymentDetails }> => {
    return invokeEdgeFunction<{ payments: PaymentDetails }>('generate-payment-link', { order });
  },

  issueNFe: async (order: Order): Promise<{ fiscal: FiscalDetails }> => {
    return invokeEdgeFunction<{ fiscal: FiscalDetails }>('issue-nfe', { order });
  },

  createShippingLabel: async (order: Order): Promise<{ logistics: LogisticsDetails }> => {
    return invokeEdgeFunction<{ logistics: LogisticsDetails }>('create-shipping-label', { order });
  }
};
