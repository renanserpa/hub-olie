import React from 'react';
import { useMedia } from '../../hooks/useMedia';
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { Loader2, ImageOff } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

export function MediaGallery({ module, category }: { module: string; category?: string }) {
  const { media, loading } = useMedia(module, category);

  if (loading) {
      return (
          <div className="h-48 flex items-center justify-center text-textSecondary bg-secondary rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin" />
          </div>
      );
  }

  if (media.length === 0) {
      return (
          <div className="h-48 flex flex-col items-center justify-center text-center text-textSecondary bg-secondary rounded-lg">
              <ImageOff className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Nenhuma mídia encontrada</p>
              <p className="text-xs">Faça o upload de um arquivo para vê-lo aqui.</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {media.map((m) => (
        <MediaPreviewDialog key={m.id} asset={m} />
      ))}
    </div>
  );
}
