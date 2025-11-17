// services/supabaseStorageService.ts
import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'media_assets';

export const supabaseStorageService = {
  /**
   * Uploads a file to the 'media_assets' bucket in Supabase Storage.
   * @param file The file to upload.
   * @param module The module (e.g., 'products', 'system').
   * @param category The category (e.g., 'logo', 'texture').
   * @returns An object with the file path and its public URL.
   */
  async uploadFile(file: File, module: string, category: string): Promise<{ path: string; publicUrl: string; }> {
    // Sanitize file name to be URL-friendly
    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-._]/g, '');
    const filePath = `${module}/${category}/${Date.now()}-${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error('Could not get public URL for the uploaded file.');
    }

    return {
      path: filePath,
      publicUrl: data.publicUrl,
    };
  }
};
