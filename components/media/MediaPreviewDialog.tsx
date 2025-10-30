import React, { useState } from 'react';
import { MediaAsset } from '../../types';
import Modal from '../ui/Modal';
import { File, Video, Image as ImageIcon } from 'lucide-react';

interface MediaPreviewDialogProps {
    asset: MediaAsset;
}

const isImage = (mimeType?: string) => mimeType?.startsWith('image/');
const isVideo = (mimeType?: string) => mimeType?.startsWith('video/');

export const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({ asset }) => {
    const [isOpen, setIsOpen] = useState(false);

    const renderThumbnail = () => {
        if (isImage(asset.mime_type)) {
            return <img src={asset.url_public} alt={asset.name} className="w-full h-full object-cover" />;
        }
        if (isVideo(asset.mime_type)) {
            return <div className="w-full h-full bg-black flex items-center justify-center"><Video className="w-6 h-6 text-white" /></div>;
        }
        return <div className="w-full h-full bg-secondary flex items-center justify-center"><File className="w-6 h-6 text-textSecondary" /></div>;
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="aspect-square w-full bg-secondary rounded-lg overflow-hidden relative group focus:outline-none focus:ring-2 focus:ring-primary"
            >
                {renderThumbnail()}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs text-center p-1">
                    {asset.name}
                </div>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={asset.name || 'Visualizar Mídia'}>
                {isImage(asset.mime_type) ? (
                    <img src={asset.url_public} alt={asset.name} className="max-w-full max-h-[80vh] mx-auto" />
                ) : isVideo(asset.mime_type) ? (
                    <video src={asset.url_public} controls autoPlay className="max-w-full max-h-[80vh] mx-auto" />
                ) : (
                    <div className="text-center py-8">
                        <p>Pré-visualização não disponível para o tipo de arquivo: {asset.mime_type}</p>
                        <a href={asset.url_public} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-4 inline-block">
                            Abrir em nova aba
                        </a>
                    </div>
                )}
            </Modal>
        </>
    );
};
