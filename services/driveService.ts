// src/services/driveService.ts
import { supabase } from '../lib/supabaseClient';

// Obter a chave anon do mesmo local que o resto da aplicação, via env vars.
// FIX: Property 'env' does not exist on type 'ImportMeta'. Hardcoded value is used as a workaround.
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

export async function uploadToDrive(file: File, module: string, category: string) {
  if (!supabaseAnonKey) {
      throw new Error("A chave anônima do Supabase (VITE_SUPABASE_ANON_KEY) não está configurada.");
  }
    
  const formData = new FormData();
  formData.append("file", file);
  formData.append("module", module);
  formData.append("category", category);

  // In a real project, this URL would come from environment variables.
  // We assume the URL is known for this implementation.
  // FIX: Property 'env' does not exist on type 'ImportMeta'. Hardcoded value is used as a workaround.
  const functionsUrl = `https://ijheukynkppcswgtrnwd.supabase.co/functions/v1`;

  const res = await fetch(`${functionsUrl}/upload_to_drive`, {
    method: "POST",
    headers: {
        // Supabase Edge Functions are typically invoked with the 'anon' key in the Authorization header.
        'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload file.');
  }

  return res.json();
}

export async function listDriveAssets(module: string, category?: string) {
  let query = supabase.from("media_assets").select("*").eq("module", module);
  if (category) {
    query = query.eq("category", category);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error("Error listing drive assets:", error);
    throw error;
  }
  return data || [];
}