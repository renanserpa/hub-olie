// supabase/functions/issue-nfe.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;

console.log("🚀 [Edge Function] issue-nfe loaded.");

serve(async (req) => {
  // This is a placeholder. A real implementation would:
  // 1. Parse the order from the request body.
  // 2. Call a fiscal provider's API (e.g., eNotas, Bling).
  // 3. Return the NFe details (PDF/XML URLs, number).

  const { order } = await req.json();
  console.log(`Issuing NFe for order: ${order?.number}`);

  const mockFiscalDetails = {
    fiscal: {
        status: 'authorized',
        nfeNumber: (Math.floor(Math.random() * 90000) + 10000).toString(),
        serie: '1',
        pdfUrl: '#',
        xmlUrl: '#'
    }
  };

  return new Response(
    JSON.stringify(mockFiscalDetails),
    { headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    }
  );
});