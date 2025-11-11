// supabase/functions/retry-scheduler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // This function would be triggered by a cron job service like Supabase's pg_cron
    console.log("⏰ [Retry Scheduler] Running scheduled job...");

    try {
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Find logs that are due for a retry
        const { data: logsToRetry, error } = await supabaseAdmin
            .from('webhook_logs')
            .select('id')
            .in('status', ['error', 'retrying'])
            .lt('retry_count', 5)
            .lte('next_retry_at', new Date().toISOString());

        if (error) throw error;

        if (!logsToRetry || logsToRetry.length === 0) {
            console.log("⏰ [Retry Scheduler] No webhooks to retry.");
            return new Response(JSON.stringify({ message: "No webhooks to retry." }), { headers: corsHeaders });
        }
        
        console.log(`⏰ [Retry Scheduler] Found ${logsToRetry.length} webhook(s) to retry.`);

        // Invoke the retry handler for each
        const retryPromises = logsToRetry.map(log => 
            supabaseAdmin.functions.invoke('retry-webhook-handler', {
                body: { logId: log.id }
            })
        );
        
        await Promise.all(retryPromises);

        return new Response(JSON.stringify({ message: `Attempted to retry ${logsToRetry.length} webhook(s).` }), {
            headers: corsHeaders,
        });

    } catch (e) {
        console.error("⏰ [Retry Scheduler] Error:", e.message);
        return new Response(JSON.stringify({ error: e.message }), {
            headers: corsHeaders,
            status: 500,
        });
    }
});