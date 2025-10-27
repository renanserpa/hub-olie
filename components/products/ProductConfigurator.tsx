
import React, { useState } from 'react';
import { Product, AppData } from '../../types';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface ProductConfiguratorProps {
    attributes: Product['attributes'];
    onAttributesChange: (attributes: Product['attributes']) => void;
    appData: AppData;
}

const MultiSelect: React.FC<{
    label: string;
    options: { value: string, label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
}> = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };
    
    const selectedLabels = options.filter(opt => selected.includes(opt.value)).map(opt => opt.label).join(', ');

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-textSecondary mb-1">{label}</label>
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-between font-normal text-textSecondary"
            >
                <span className="truncate">{selectedLabels || "Selecione..."}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer text-sm"
                        >
                            <span>{option.label}</span>
                            {selected.includes(option.value) && <Check className="h-4 w-4 text-primary" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({ attributes, onAttributesChange, appData }) => {
    
    const { catalogs } = appData;
    
    const colorOptions = (type: keyof typeof catalogs.cores_texturas) => {
        return catalogs.cores_texturas[type].map(color => ({ value: color.id, label: color.name }));
    };

    const handleMultiSelectChange = (attr: keyof Omit<Product['attributes'], 'embroidery'>, value: string[]) => {
        onAttributesChange({ ...attributes, [attr]: value });
    };

    const handleEmbroideryToggle = (enabled: boolean) => {
        onAttributesChange({ ...attributes, embroidery: enabled });
    };

    return (
        <div className="p-4 space-y-4 border rounded-lg bg-secondary/50">
            <h4 className="font-semibold text-textPrimary">Opções de Personalização</h4>
            
            <MultiSelect
                label="Cores de Tecido Disponíveis"
                options={colorOptions('tecido')}
                selected={attributes?.fabricColor || []}
                onChange={(val) => handleMultiSelectChange('fabricColor', val)}
            />

            <MultiSelect
                label="Cores de Zíper Disponíveis"
                options={colorOptions('ziper')}
                selected={attributes?.zipperColor || []}
                onChange={(val) => handleMultiSelectChange('zipperColor', val)}
            />
            
            <div className="pt-2">
                 <label className="flex items-center gap-3 text-sm text-textPrimary cursor-pointer font-medium">
                    <input 
                        type="checkbox"
                        checked={!!attributes?.embroidery} 
                        onChange={(e) => handleEmbroideryToggle(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Permite Bordado
                 </label>
            </div>
        </div>
    );
};

export default ProductConfigurator;
