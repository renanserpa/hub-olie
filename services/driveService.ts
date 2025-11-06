// src/services/driveService.ts
import { supabase } from '../lib/supabaseClient';

// This public (anon) key is safe for client-side use and is used to authenticate with Supabase Edge Functions.
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU2OTEsImV4cCI6MjA3NjAzMTY5MX0.dpX90AmxL_JrxkYacPFkzQzhmCETDTa21Up5TdQgLLk";

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
        // Supabase Edge Functions are typically invoked with the 'anon' key in the Authorization header.
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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