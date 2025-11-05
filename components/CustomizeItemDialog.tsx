import React, { useState, useEffect, useMemo } from 'react';
import { Product, AppData, ProductPart } from '../types';
import Modal from './ui/Modal';
import { Button } from './ui/Button';

// Helper to get options for a configurable part from appData
const getOptionsForSource = (source: ProductPart['options_source'] | undefined, appData: AppData): { id: string, name: string, hex?: string }[] => {
    if (!source || !appData) return [];
    const mapping = {
        fabric_colors: appData.catalogs.cores_texturas.tecido,
        zipper_colors: appData.catalogs.cores_texturas.ziper,
        lining_colors: appData.catalogs.cores_texturas.forro,
        puller_colors: appData.catalogs.cores_texturas.puxador,
        bias_colors: appData.catalogs.cores_texturas.vies,
        embroidery_colors: appData.catalogs.cores_texturas.bordado,
        config_materials: appData.config_materials
    };
    const result = (mapping[source] as any[]) || [];
    return result.map(item => ({ id: item.id, name: item.name, hex: (item as any).hex || undefined }));
};


interface CustomizeItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { config: Record<string, string>, variantName: string, finalPrice: number }) => void;
  initialConfig: Record<string, string>;
  product: Product;
  appData: AppData;
}

const CustomizeItemDialog: React.FC<CustomizeItemDialogProps> = ({ isOpen, onClose, onSave, initialConfig, product, appData }) => {
    const [configuration, setConfiguration] = useState<Record<string, string>>(initialConfig || {});

    useEffect(() => {
        setConfiguration(initialConfig || {});
    }, [initialConfig, isOpen]);
    
    const handleSelectionChange = (key: string, value: string) => {
        setConfiguration(prev => ({...prev, [key]: value}));
    };
    
    // Calculate which options should be disabled based on combination rules
    const disabledOptions = useMemo(() => {
        const disabled: Record<string, string[]> = {};
        if (!product.combination_rules || !product.configurable_parts) return disabled;

        const allOptions: Record<string, string[]> = {};
        product.configurable_parts.forEach(part => {
             allOptions[part.key] = getOptionsForSource(part.options_source, appData).map(opt => opt.id);
             disabled[part.key] = [];
        });
        
        product.combination_rules.forEach(rule => {
            const conditionMet = configuration[rule.condition.part_key] === rule.condition.option_id;
            if (conditionMet) {
                const targetPart = rule.consequence.part_key;
                const allowed = rule.consequence.allowed_option_ids;
                const optionsForTarget = allOptions[targetPart] || [];
                const toDisable = optionsForTarget.filter(optId => !allowed.includes(optId));
                disabled[targetPart] = [...(disabled[targetPart] || []), ...toDisable];
            }
        });

        return disabled;

    }, [configuration, product.combination_rules, product.configurable_parts, appData]);

    const VisualPreview: React.FC = () => {
        const partsToVisualize = product.configurable_parts?.filter(p => p.options_source.endsWith('_colors')) || [];
        if (partsToVisualize.length === 0) return null;
        
        return (
            <div className="p-4 border rounded-lg bg-secondary/50 space-y-3">
                <h4 className="font-semibold text-sm">Pré-visualização</h4>
                <div className="flex gap-4 items-center justify-center p-4">
                    {partsToVisualize.map(part => {
                        const selectedOptionId = configuration[part.key];
                        const options = getOptionsForSource(part.options_source, appData);
                        const selectedOption = options.find(opt => opt.id === selectedOptionId);
                        const color = selectedOption?.hex || '#ccc';
                        
                        return (
                            <div key={part.id} className="text-center">
                                <div className="w-12 h-12 rounded-lg border-2 shadow-inner" style={{ backgroundColor: color }}></div>
                                <p className="text-xs mt-1">{part.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    };
    
    const handleSave = () => {
        let variantName = product.name;
        let finalPrice = product.base_price;
        const configParts: string[] = [];

        if (configuration.size) {
            const size = product.available_sizes?.find(s => s.id === configuration.size);
            if(size) configParts.push(size.name);
        }

        product.configurable_parts?.forEach(part => {
            const selectedOptionId = configuration[part.key];
            if (selectedOptionId) {
                const options = getOptionsForSource(part.options_source, appData);
                const option = options.find(o => o.id === selectedOptionId);
                if (option) configParts.push(option.name);
            }
        });
        
        if (configParts.length > 0) {
            variantName += ` - ${configParts.join(' / ')}`;
        }

        onSave({ config: configuration, variantName, finalPrice });
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Personalizar: ${product.name}`} className="max-w-2xl">
            <div className="space-y-6">
                <VisualPreview />
                <div className="space-y-4">
                    {product.available_sizes && product.available_sizes.length > 0 && (
                        <div>
                            <label className="font-semibold text-sm">Tamanho</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.available_sizes.map(size => (
                                    <Button
                                        key={size.id}
                                        type="button"
                                        variant={configuration.size === size.id ? 'primary' : 'outline'}
                                        onClick={() => handleSelectionChange('size', size.id)}
                                    >{size.name}</Button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {product.configurable_parts?.map(part => {
                        const options = getOptionsForSource(part.options_source, appData);
                        return (
                            <div key={part.id}>
                                <label className="font-semibold text-sm">{part.name}</label>
                                <select 
                                    value={configuration[part.key] || ''} 
                                    onChange={e => handleSelectionChange(part.key, e.target.value)}
                                    className="w-full mt-1 p-2 border rounded-md bg-secondary"
                                >
                                    <option value="">Selecione...</option>
                                    {options.map(opt => (
                                        <option 
                                            key={opt.id} 
                                            value={opt.id}
                                            disabled={(disabledOptions[part.key] || []).includes(opt.id)}
                                        >
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )
                    })}
                </div>
                 <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleSave}>Salvar Personalização</Button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomizeItemDialog;