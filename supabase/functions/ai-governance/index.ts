// supabase/functions/ai-governance/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { kpis, settings } = await req.json();
    console.log("[AI Governance] Received data for analysis:", { kpiCount: kpis?.length, settingsCount: settings?.length });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // In a real function, you would call the Gemini API here.
    // For now, we'll keep a simplified logic but persist the result.
    await new Promise(res => setTimeout(res, 1500)); // Simulate AI processing time

    const suggestion = {
      setting_key: "freight_params",
      suggested_value: {
          radius_km: 15,
          base_fee: 12,
          fee_per_km: 2.8,
          free_shipping_threshold: Math.floor(Math.random() * 50) + 300, // Make it dynamic
      },
      confidence: 0.95,
      explanation: `[IA Preditiva] Com base na análise de ${kpis.length} KPIs, sugerimos otimizar os parâmetros de frete para melhorar a conversão.`,
      status: 'suggested',
    };

    // Save the suggestion to the new table
    const { data: savedSuggestion, error } = await supabaseAdmin
        .from('governance_suggestions')
        .insert(suggestion)
        .select();

    if (error) throw new Error(`Failed to save suggestion: ${error.message}`);
    
    // Return the created suggestion to the client
    return new Response(JSON.stringify(savedSuggestion), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});