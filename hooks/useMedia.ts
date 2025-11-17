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
      const savedAsset = await mediaService.uploadFile(file, module, category || "default");
      
      if (onUploadSuccess) {
        onUploadSuccess({ drive_file_id: savedAsset.drive_file_id, url_public: savedAsset.url_public });
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
