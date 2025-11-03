import React from 'react';
import { useColorLab } from '../../hooks/useColorLab';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, Cuboid, Palette, Check } from 'lucide-react';
import RenderCanvas from './RenderCanvas';
import { cn } from '../../lib/utils';

const ColorLabPanel: React.FC = () => {
    const {
        isLoading, products, fabricColors, fabricTextures,
        selectedProduct, selectedProductId, setSelectedProductId,
        selectedColor, setSelectedColor, selectedTexture, setSelectedTexture
    } = useColorLab();

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Cuboid size={20}/> ColorLab 3D - Simulador</CardTitle>
                </CardHeader>
                <CardContent>
                    <RenderCanvas
                        productName={selectedProduct?.name || 'Produto'}
                        color={selectedColor}
                        textureUrl={selectedTexture}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette size={20}/> Opções</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Produto</label>
                        <select
                            value={selectedProductId}
                            onChange={e => setSelectedProductId(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md bg-secondary"
                        >
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Cor do Tecido</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {fabricColors.map(color => (
                                <button
                                    key={color.id}
                                    onClick={() => setSelectedColor(color.hex)}
                                    className="w-8 h-8 rounded-full border-2"
                                    style={{ backgroundColor: color.hex, borderColor: selectedColor === color.hex ? '#D2A66D' : 'transparent' }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Textura</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                             {fabricTextures.map(texture => (
                                <button
                                    key={texture.id}
                                    onClick={() => setSelectedTexture(texture.image_url || null)}
                                    className={cn("w-10 h-10 rounded-md border-2 overflow-hidden relative", selectedTexture === texture.image_url ? 'border-primary' : 'border-transparent')}
                                    title={texture.name}
                                >
                                    <img src={texture.image_url} alt={texture.name} className="w-full h-full object-cover"/>
                                    {selectedTexture === texture.image_url && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="text-center p-4 bg-amber-50 text-amber-800 text-xs rounded-lg border-t mt-4">
                        🚧 Renderização 3D (Three.js) e upload de modelos em desenvolvimento.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ColorLabPanel;