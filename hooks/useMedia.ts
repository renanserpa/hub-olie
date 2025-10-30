import { useEffect, useState, useCallback } from "react";
import { mediaService } from '../services/mediaService';
import { MediaAsset } from "../types";
import { toast } from "./use-toast";

export function useMedia(module: string, category?: string) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
        const data = await mediaService.listAssets(module, category);
        setMedia(data);
    } catch (e) {
        toast({ title: "Erro", description: "Não foi possível carregar as mídias.", variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  }, [module, category]);

  async function handleUpload(
    file: File,
    onUploadSuccess?: (result: { drive_file_id: string; url_public: string }) => void
  ) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await mediaService.uploadFile(file, module, category || "default");
      // The sandbox service returns `id` as drive_file_id and `webViewLink` as url_public. The real one might differ. Let's align.
      const uploadResult = { drive_file_id: result.id, url_public: result.webViewLink };
      
      if (onUploadSuccess) {
        onUploadSuccess(uploadResult);
      }
      // Only refresh the gallery if there's no specific callback to handle the result.
      // If there is a callback, the parent component is responsible for what happens next.
      if (!onUploadSuccess) {
          await refresh();
      }
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { media, loading, uploading, handleUpload, refresh };
}