// supabase/functions/retry-webhook-handler.ts
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
    const { logId } = await req.json();
    if (!logId) throw new Error("logId is required.");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch the original log
    const { data: log, error: fetchError } = await supabaseAdmin
      .from('webhook_logs')
      .select('*')
      .eq('id', logId)
      .single();

    if (fetchError) throw new Error(`Webhook log not found: ${fetchError.message}`);
    if (!log) throw new Error("Webhook log not found.");

    // 2. Simulate re-posting to the original destination (we don't have the real URL)
    console.log(`[Retry Webhook] Simulating re-post for integration ${log.integration_id} with payload:`, log.payload);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network call

    // 3. Update the log status to 'success'
    const { error: updateError } = await supabaseAdmin
      .from('webhook_logs')
      .update({
        status: 'success',
        retry_count: (log.retry_count || 0) + 1,
      })
      .eq('id', logId);

    if (updateError) throw new Error(`Failed to update webhook log: ${updateError.message}`);

    // 4. Log the retry action in system_audit
    await supabaseAdmin.from('system_audit').insert({
        key: 'WEBHOOK_RETRY',
        status: 'SUCCESS',
        details: { logId: logId, integration_id: log.integration_id }
    });

    return new Response(JSON.stringify({ message: "Webhook reprocessado com sucesso." }), {
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