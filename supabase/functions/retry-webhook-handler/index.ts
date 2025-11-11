// supabase/functions/retry-webhook-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000 * 60; // 1 minute

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

    const { data: log, error: fetchError } = await supabaseAdmin
      .from('webhook_logs')
      .select('*')
      .eq('id', logId)
      .single();

    if (fetchError) throw new Error(`Webhook log not found: ${fetchError.message}`);
    if (!log) throw new Error("Webhook log not found.");

    // Simulate re-posting to the original destination
    console.log(`[Retry Webhook] Simulating re-post for integration ${log.integration_id} with payload:`, log.payload);
    await new Promise(resolve => setTimeout(resolve, 500));
    const isSuccess = Math.random() > 0.3; // Simulate a 70% success rate on retry

    let updateData: any = {};
    const newRetryCount = (log.retry_count || 0) + 1;

    if (isSuccess) {
        updateData = { status: 'success', retry_count: newRetryCount, last_error: null, next_retry_at: null };
    } else if (newRetryCount >= MAX_RETRIES) {
        updateData = { status: 'failed', retry_count: newRetryCount, last_error: "Max retries reached.", next_retry_at: null };
    } else {
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, newRetryCount -1);
        const nextRetry = new Date(Date.now() + backoffTime);
        updateData = { status: 'retrying', retry_count: newRetryCount, last_error: "Simulated retry failure.", next_retry_at: nextRetry.toISOString() };
    }

    const { error: updateError } = await supabaseAdmin.from('webhook_logs').update(updateData).eq('id', logId);
    if (updateError) throw new Error(`Failed to update webhook log: ${updateError.message}`);

    await supabaseAdmin.from('system_audit').insert({
        key: 'WEBHOOK_RETRY_ATTEMPT',
        status: isSuccess ? 'SUCCESS' : 'FAILURE',
        details: { logId: logId, integration_id: log.integration_id, attempt: newRetryCount, newStatus: updateData.status }
    });

    return new Response(JSON.stringify({ message: `Webhook reprocessado. Novo status: ${updateData.status}` }), {
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