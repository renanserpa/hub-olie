import React, { useState, useCallback } from 'react';
import { useMedia } from '../../hooks/useMedia';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';

interface MediaUploadCardProps {
  module: string;
  category?: string;
  onUploadSuccess?: (result: { drive_file_id: string; url_public: string }) => void;
  multiple?: boolean;
}

export function MediaUploadCard({ module, category, onUploadSuccess, multiple = false }: MediaUploadCardProps) {
  const { handleUpload, uploading } = useMedia(module, category);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast({ title: "Apenas um arquivo permitido", description: "Apenas o primeiro arquivo será enviado.", variant: "destructive" });
      handleUpload(files[0], onUploadSuccess);
      return;
    }
    
    for (const file of Array.from(files)) {
      handleUpload(file, onUploadSuccess);
    }
  }, [handleUpload, onUploadSuccess, multiple]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

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
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
        multiple={multiple}
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
                {multiple ? 'Clique para enviar arquivos' : 'Clique para enviar um arquivo'}
            </label>
            <p className="text-xs">ou arraste e solte aqui</p>
        </>
      )}
    </div>
  );
}
