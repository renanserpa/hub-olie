import React from 'react';

interface RenderCanvasProps {
    productName: string;
    color: string | null;
    textureUrl: string | null;
}

const RenderCanvas: React.FC<RenderCanvasProps> = ({ productName, color, textureUrl }) => {
    
    const style: React.CSSProperties = {
        backgroundColor: color || '#e0e0e0',
        backgroundImage: textureUrl ? `url(${textureUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="aspect-video w-full bg-secondary rounded-lg flex items-center justify-center p-4" style={style}>
            <div className="text-center bg-black/30 text-white p-4 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-bold">{productName}</h3>
                <p className="text-sm">Pré-visualização da Simulação</p>
                <div className="mt-2 text-xs">
                    <p>Cor: {color || 'N/A'}</p>
                    <p>Textura: {textureUrl ? textureUrl.split('/').pop() : 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default RenderCanvas;