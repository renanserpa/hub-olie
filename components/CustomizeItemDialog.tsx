

import React, { useState, useMemo } from 'react';
import { ConfigJson, Product, AppData } from '../types';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface CustomizeItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConfigJson) => void;
  initialConfig: ConfigJson;
  product: Product;
  appData: AppData;
}

const CustomizeItemDialog: React.FC<CustomizeItemDialogProps> = ({ isOpen, onClose, onSave, initialConfig, product, appData }) => {
    const [config, setConfig] = useState<ConfigJson>(initialConfig);

    const handleChange = (field: keyof ConfigJson, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleEmbroideryChange = (field: 'enabled' | 'text' | 'font', value: any) => {
        setConfig(prev => ({
            ...prev,
            embroidery: {
                ...prev.embroidery,
                enabled: prev.embroidery?.enabled || false,
                text: prev.embroidery?.text || '',
                font: prev.embroidery?.font || '',
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        onSave(config);
    };

    const getColorOptions = (colorType: 'tecido' | 'ziper' | 'forro' | 'vies') => {
        const colorIds = product.attributes?.[`${colorType}Color` as keyof typeof product.attributes] as string[] | undefined;
        if (!colorIds) return [];
        return appData.catalogs.cores_texturas[colorType].filter(c => colorIds.includes(c.id));
    };
    
    const fontOptions = appData.catalogs.fontes_monogramas;
    const selectedFont = fontOptions.find(f => f.id === config.embroidery?.font);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Personalizar: ${product.name}`}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                
                {product.attributes?.fabricColor && (
                     <div>
                        <label className="block text-sm font-medium text-textSecondary">Cor do Tecido</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {getColorOptions('tecido').map(color => (
                                <button key={color.id} type="button" onClick={() => handleChange('fabricColor', color.name)}
                                    className={cn(`w-8 h-8 rounded-full border-2 flex items-center justify-center`, config.fabricColor === color.name ? 'border-primary ring-2 ring-primary/50' : 'border-border')}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {product.attributes?.zipperColor && (
                     <div>
                        <label className="block text-sm font-medium text-textSecondary">Cor do Zíper</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                             {getColorOptions('ziper').map(color => (
                                <button key={color.id} type="button" onClick={() => handleChange('zipperColor', color.name)}
                                    className={cn(`w-8 h-8 rounded-full border-2`, config.zipperColor === color.name ? 'border-primary ring-2 ring-primary/50' : 'border-border')}
                                    style={{ backgroundColor: color.hex }}
                                     title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {product.attributes?.biasColor && (
                     <div>
                        <label className="block text-sm font-medium text-textSecondary">Cor do Viés</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                             {getColorOptions('vies').map(color => (
                                <button key={color.id} type="button" onClick={() => handleChange('biasColor', color.name)}
                                    className={cn(`w-8 h-8 rounded-full border-2`, config.biasColor === color.name ? 'border-primary ring-2 ring-primary/50' : 'border-border')}
                                    style={{ backgroundColor: color.hex }}
                                     title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {product.attributes?.embroidery && (
                    <div className="space-y-3 pt-4 border-t">
                         <label className="flex items-center gap-2 text-sm text-textPrimary cursor-pointer font-medium">
                            <input 
                                type="checkbox" 
                                checked={!!config.embroidery?.enabled} 
                                onChange={(e) => handleEmbroideryChange('enabled', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Adicionar Bordado
                         </label>
                         {config.embroidery?.enabled && (
                             <div className="pl-6 space-y-3 animate-fade-in-up">
                                 <div>
                                    <label htmlFor="text" className="block text-sm font-medium text-textSecondary">Texto do Bordado</label>
                                    <input id="text" type="text" value={config.embroidery.text || ''} onChange={e => handleEmbroideryChange('text', e.target.value)} maxLength={50} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                     <label htmlFor="font" className="block text-sm font-medium text-textSecondary">Fonte</label>
                                     <select id="font" value={config.embroidery.font || ''} onChange={e => handleEmbroideryChange('font', e.target.value)} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                                        <option value="">Selecione a fonte</option>
                                        {fontOptions.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}
                                     </select>
                                </div>
                                {config.embroidery.text && (
                                    <div className="p-4 bg-secondary rounded-lg relative">
                                        <p className="text-xs text-textSecondary">Pré-visualização:</p>
                                        <p className="text-2xl text-center py-4" style={{ fontFamily: selectedFont?.name || 'serif' }}>
                                            {config.embroidery.text}
                                        </p>
                                        <span className="absolute bottom-2 right-2 text-xs text-textSecondary bg-background px-2 py-0.5 rounded-md">Preview</span>
                                    </div>
                                )}
                             </div>
                         )}
                    </div>
                )}
                
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-textSecondary">Observações do Item</label>
                    <textarea id="notes" value={config.notes || ''} onChange={e => handleChange('notes', e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
            </div>
             <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Personalização</Button>
            </div>
        </Modal>
    );
};

export default CustomizeItemDialog;