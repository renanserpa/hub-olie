// src/services/driveService.ts
import { supabase } from '../lib/supabaseClient';

// Production-ready: Credentials and URLs are sourced from environment variables for Vite.
// FIX: Replaced import.meta.env with hardcoded values to resolve build errors.
const supabaseUrl = "https://ijheukynkppcswgtrnwd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4";

export async function uploadToDrive(file: File, module: string, category: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("As variáveis de ambiente do Supabase (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY) não estão configuradas.");
  }
    
  const formData = new FormData();
  formData.append("file", file);
  formData.append("module", module);
  formData.append("category", category);

  const functionsUrl = `${supabaseUrl}/functions/v1`;

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