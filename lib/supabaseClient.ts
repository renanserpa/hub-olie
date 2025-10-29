import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qrfvdoecpmcnlpxklcsu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk";

// Dynamically detect the current origin
const currentOrigin = window?.location?.origin ?? "unknown";
console.log("🌐 Detected current origin:", currentOrigin);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
  global: {
    // FIX: Typed the rest parameter `...args` to match the parameters of the native `fetch` function.
    // This provides TypeScript with a tuple type, resolving the spread argument error.
    fetch: async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await fetch(...args);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error("❌ Supabase fetch error:", {
            status: response.status,
            body: errorBody,
            origin: currentOrigin,
          });
        }
        return response;
      } catch (e: any) {
        console.error(
          "🔥 Supabase fetch failed catastrophically:",
          e.message,
          "\n🌍 Origin:",
          currentOrigin,
          "\n💡 Action: Add this origin to Supabase Allowed Origins to fix this."
        );
        throw e;
      }
    },
  },
});

// Initial connectivity test
(async () => {
  console.log("🔌 Testing Supabase connection from:", currentOrigin);
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id`, // Using a real table to test RLS
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    console.log(
      res.ok
        ? "✅ Supabase connection OK — Origin accepted"
        : `⚠️ Connection failed: Status ${res.status}. This is likely a CORS issue.`
    );
  } catch (err: any) {
    // This catch block is crucial for detecting network-level failures like CORS
    console.error("🚫 Network/CORS issue detected:", err.message);
  }
})();