import React, { useState, useCallback } from 'react';
import { useMedia } from '../../hooks/useMedia';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';

interface MediaUploadCardProps {
  module: string;
  category?: string;
  onUploadSuccess?: (result: { drive_file_id: string; url_public: string }) => void;
}

export function MediaUploadCard({ module, category, onUploadSuccess }: MediaUploadCardProps) {
  const { handleUpload, uploading } = useMedia(module, category);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File | null) => {
      if (file) {
          handleUpload(file, onUploadSuccess);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files ? e.target.files[0] : null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  }, [handleUpload]);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };
  
  const uniqueId = `file-upload-${module}-${category || 'default'}`;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      className={cn(
        "relative p-4 border-2 border-dashed rounded-lg flex flex-col gap-2 items-center justify-center text-center text-textSecondary h-48 transition-colors",
        isDragging ? "border-primary bg-accent" : "border-border",
        uploading ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <input
        id={uniqueId}
        type="file"
        accept="image/*,video/*,application/pdf"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      {uploading ? (
        <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Enviando...</p>
        </>
      ) : (
        <>
            <UploadCloud className="w-8 h-8" />
            <label htmlFor={uniqueId} className="font-medium text-primary cursor-pointer hover:underline">
                Clique para enviar
            </label>
            <p className="text-xs">ou arraste e solte o arquivo aqui</p>
        </>
      )}
    </div>
  );
}