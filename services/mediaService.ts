import { dataService } from './dataService';
import { MediaAsset } from '../types';
import { toast } from '../hooks/use-toast';
import { supabaseStorageService } from './supabaseStorageService';

export const mediaService = {
    async uploadFile(file: File, module: string, category: string): Promise<MediaAsset> {
        toast({ title: "Enviando arquivo...", description: file.name });
        try {
            // 1. Upload file to Supabase Storage
            const { path, publicUrl } = await supabaseStorageService.uploadFile(file, module, category);

            // 2. Create a record in the media_assets table
            const newAsset: Omit<MediaAsset, 'id' | 'created_at'> = {
                drive_file_id: path, // Use this field for the Supabase path
                module,
                category,
                name: file.name,
                mime_type: file.type,
                size: file.size,
                url_public: publicUrl,
            };

            const savedAsset = await dataService.addDocument<MediaAsset>('media_assets', newAsset);
            
            toast({ title: "Sucesso!", description: "Arquivo salvo no Supabase Storage."});
            return savedAsset;

        } catch(e) {
            toast({ title: "Erro no Upload", description: (e as Error).message, variant: 'destructive' });
            throw e;
        }
    },

    async listAssets(module: string, category?: string): Promise<MediaAsset[]> {
        const allAssets = await dataService.getCollection<MediaAsset>('media_assets');
        let filtered = allAssets.filter(asset => asset.module === module);
        if (category) {
            filtered = filtered.filter(asset => asset.category === category);
        }
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
};
