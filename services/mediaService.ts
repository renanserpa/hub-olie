import { isSandbox } from '../lib/runtime';
import { sandboxDb } from './sandboxDb';
import * as driveService from './driveService';
import { dataService } from './dataService';
import { MediaAsset } from '../types';
import { toast } from '../hooks/use-toast';

export const mediaService = {
    async uploadFile(file: File, module: string, category: string): Promise<{ id: string; webViewLink: string;[key: string]: any; }> {
        toast({ title: "Enviando arquivo...", description: file.name });
        if (isSandbox()) {
            return sandboxDb.uploadFile(file, module, category);
        }
        try {
            const result = await driveService.uploadToDrive(file, module, category);
            toast({ title: "Sucesso!", description: "Arquivo enviado para o Google Drive."});
            return result;
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