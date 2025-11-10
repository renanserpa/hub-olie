import React, { useState, useEffect } from 'react';
import { Product, AppData, EmbroideryColor } from '../../../types';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { calculateContrastRatio } from '../../../lib/utils';
import { AlertTriangle, CheckCircle, Type } from 'lucide-react';

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={cn("bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border shadow-sm", className)}>
        <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);


const ProductPersonalizationPanel: React.FC<{
    product: Product;
    appData: AppData;
}> = ({ product, appData }) => {
    const [personalizationType, setPersonalizationType] = useState<'embroidery' | 'hot_stamping' | 'tag'>('embroidery');
    const [embroideryText, setEmbroideryText] = useState('Olie');
    const [embroideryFont, setEmbroideryFont] = useState(appData.catalogs.fontes_monogramas[0]?.id || '');
    const [embroideryColorId, setEmbroideryColorId] = useState(appData.catalogs.cores_texturas.bordado[0]?.id || '');
    const [embroideryHeight, setEmbroideryHeight] = useState(15);
    const [fabricColorId, setFabricColorId] = useState(appData.catalogs.cores_texturas.tecido[0]?.id || '');
    
    const [contrast, setContrast] = useState(1);
    const hasEnoughContrast = contrast >= 4.5;

    useEffect(() => {
        const fabric = appData.catalogs.cores_texturas.tecido.find(c => c.id === fabricColorId);
        const thread = appData.catalogs.cores_texturas.bordado.find(c => c.id === embroideryColorId);
        if (fabric && thread) {
            const ratio = calculateContrastRatio(fabric.hex, thread.hex);
            setContrast(ratio);
        }
    }, [fabricColorId, embroideryColorId, appData.catalogs]);

    const getFontName = (fontId: string) => {
        return appData.catalogs.fontes_monogramas.find(f => f.id === fontId)?.name || 'sans-serif';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Section title="Tipo e Configuração da Personalização">
                    <div className="flex space-x-2 p-1 bg-secondary rounded-lg">
                        {['Bordado', 'Hot-Stamping', 'Tag Metálica'].map(type => (
                            <Button
                                key={type}
                                type="button"
                                variant={type === 'Bordado' ? 'primary' : 'ghost'}
                                className="flex-1"
                                disabled={type !== 'Bordado'}
                                title={type !== 'Bordado' ? 'Em breve' : ''}
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                    {personalizationType === 'embroidery' && (
                        <div className="space-y-4 pt-2">
                             <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Texto</label>
                                <input value={embroideryText} onChange={e => setEmbroideryText(e.target.value)} className="w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Fonte</label>
                                <select value={embroideryFont} onChange={e => setEmbroideryFont(e.target.value)} className="w-full p-2 border rounded-md">
                                    {appData.catalogs.fontes_monogramas.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Cor da Linha</label>
                                <select value={embroideryColorId} onChange={e => setEmbroideryColorId(e.target.value)} className="w-full p-2 border rounded-md">
                                    {appData.catalogs.cores_texturas.bordado.map(color => <option key={color.id} value={color.id}>{color.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-textSecondary mb-1">Altura ({embroideryHeight}mm)</label>
                                <input type="range" min="10" max="25" value={embroideryHeight} onChange={e => setEmbroideryHeight(Number(e.target.value))} className="w-full" />
                            </div>
                        </div>
                    )}
                </Section>
                 <Section title="Simulador de Tecido (para Contraste)">
                     <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Cor do Tecido Externo</label>
                        <select value={fabricColorId} onChange={e => setFabricColorId(e.target.value)} className="w-full p-2 border rounded-md">
                            {appData.catalogs.cores_texturas.tecido.map(color => <option key={color.id} value={color.id}>{color.name}</option>)}
                        </select>
                    </div>
                </Section>
            </div>
            <div className="space-y-6">
                <Section title="Visualização em Tempo Real">
                     <div 
                        className="w-full aspect-video rounded-lg flex items-center justify-center transition-colors duration-300" 
                        style={{ backgroundColor: appData.catalogs.cores_texturas.tecido.find(c => c.id === fabricColorId)?.hex || '#ccc' }}
                     >
                        <span 
                            className="text-4xl transition-colors duration-300" 
                            style={{ 
                                color: appData.catalogs.cores_texturas.bordado.find(c => c.id === embroideryColorId)?.hex || '#000',
                                fontFamily: getFontName(embroideryFont),
                                fontSize: `${embroideryHeight * 2}px` // Approximate scaling
                            }}
                        >
                            {embroideryText}
                        </span>
                     </div>
                     <div className={cn(
                        "p-3 rounded-lg text-sm flex items-start gap-3 border",
                        hasEnoughContrast ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                     )}>
                        {hasEnoughContrast ? <CheckCircle className="w-5 h-5 mt-0.5"/> : <AlertTriangle className="w-5 h-5 mt-0.5"/>}
                        <div>
                            <h4 className="font-semibold">Contraste: {contrast.toFixed(2)}:1</h4>
                            <p className="text-xs">{hasEnoughContrast ? "Ótima legibilidade." : "Abaixo do mínimo de 4.5:1. Escolha uma cor mais clara ou escura."}</p>
                        </div>
                     </div>
                </Section>
            </div>
        </div>
    );
};

export default ProductPersonalizationPanel;
