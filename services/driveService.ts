// src/services/driveService.ts
import { supabase } from '../lib/supabaseClient';

export async function uploadToDrive(file: File, module: string, category: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("module", module);
  formData.append("category", category);

  // In a real project, this URL would come from environment variables.
  // We assume the URL is known for this implementation.
  const functionsUrl = "https://qrfvdoecpmcnlpxklcsu.supabase.co/functions/v1";

  const res = await fetch(`${functionsUrl}/upload_to_drive`, {
    method: "POST",
    headers: {
        // The service key is required for calling Edge Functions that use it.
        // This is a placeholder as the real key should be in a secure env var.
        'Authorization': `Bearer ${"SUPABASE_SERVICE_KEY_PLACEHOLDER"}`
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
