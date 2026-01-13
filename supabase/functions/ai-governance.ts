// supabase/functions/ai-governance.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // In a real function, you would call the Gemini API here.
    // For now, we simulate the logic from aiTunerService.ts.
    
    await new Promise(res => setTimeout(res, 1500)); // Simulate AI processing time

    const suggestion = {
      key: "freight_params",
      newValue: {
          radius_km: 15,
          base_fee: 12,
          fee_per_km: 2.8,
          free_shipping_threshold: 350,
      },
      confidence: 0.95,
      explanation: `[IA Preditiva] O custo médio de frete aumentou. Sugerimos ajustar o raio e o valor para frete grátis para otimizar a conversão.`,
    };

    const suggestions = [suggestion]; // Return as an array

    return new Response(JSON.stringify(suggestions), {
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