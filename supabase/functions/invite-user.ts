import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// FIX: Declare Deno to satisfy TypeScript compiler in environments without Deno types.
declare const Deno: any;

// CORS headers for preflight and actual requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      throw new Error("Email, password, and role are required.");
    }

    // Create an admin client to interact with Supabase
    const supabaseAdmin = createClient(
      // These are automatically available in the Supabase Edge Function environment
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Create the user in the auth schema
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm for simplicity
      app_metadata: { role: role } // Store role in app_metadata for RLS
    });

    if (authError) throw authError;
    if (!user) throw new Error("User creation failed in auth step.");

    // 2. Insert the user profile in the public schema
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        email: email,
        role: role,
      });

    if (profileError) {
      // If profile insert fails, attempt to delete the auth user to prevent orphans
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw profileError;
    }
    
    return new Response(JSON.stringify({ message: "User invited successfully" }), {
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