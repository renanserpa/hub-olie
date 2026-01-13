// supabase/functions/webhook-handler.ts
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

  let status: 'success' | 'error' = 'success';
  let errorMessage: string | null = null;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const url = new URL(req.url);
    const integrationId = url.searchParams.get('integration_id');
    const payload = await req.json();

    if (!integrationId) {
      throw new Error("integration_id query parameter is required.");
    }

    // Simulate a random failure for demonstration purposes
    if (Math.random() > 0.75) {
        throw new Error("Simulated webhook processing failure.");
    }

    const { error } = await supabaseClient
      .from('webhook_logs')
      .insert({ 
          integration_id: integrationId, 
          payload: payload,
          status: 'success',
          retry_count: 0
      });

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Webhook received" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    status = 'error';
    errorMessage = error.message;
    console.error(`[Webhook Handler Error] ${errorMessage}`);

    // Attempt to log the failure to the database
    try {
        const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
        const url = new URL(req.url);
        const integrationId = url.searchParams.get('integration_id');
        
        if (integrationId) {
            await supabaseAdmin.from('webhook_logs').insert({
                integration_id: integrationId,
                payload: { error: "Failed to parse original payload", received_headers: Object.fromEntries(req.headers) },
                status: 'error',
                retry_count: 0
            });
        }
    } catch(dbError) {
        console.error(`[Webhook Handler] CRITICAL: Failed to log error to DB.`, dbError.message);
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});