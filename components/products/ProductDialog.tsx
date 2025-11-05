import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product, ProductCategory, AnyProduct, AppData } from '../../types';
import { Loader2 } from 'lucide-react';
import ProductConfigurator from './ProductConfigurator';

interface ProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AnyProduct | Product) => Promise<void>;
    product: Product | null;
    categories: ProductCategory[];
    appData: AppData;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, onClose, onSave, product, categories, appData }) => {
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                name: '',
                base_sku: '',
                base_price: 0,
                category: '',
                description: '',
                hasVariants: false,
                attributes: {},
            });
        }
    }, [product, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleAttributesChange = (attributes: Product['attributes']) => {
        setFormData(prev => ({...prev, attributes}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData as Product);
        } catch(e) {
            // Error toast is handled by hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Editar Produto' : 'Novo Produto'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                
                <div>
                    <label className={labelStyle}>Nome do Produto *</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} />
                </div>

                <div>
                    <label className={labelStyle}>Descrição</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={inputStyle} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>SKU *</label>
                        <input name="base_sku" value={formData.base_sku || ''} onChange={handleChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>Categoria</label>
                         <select name="category" value={formData.category || ''} onChange={handleChange} required className={inputStyle}>
                            <option value="">Selecione</option>
                            {/* Note: categories is empty because the table doesn't exist, so this will be empty */}
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>Preço Base (R$)</label>
                        <input name="base_price" type="number" step="0.01" value={formData.base_price || ''} onChange={handleChange} required className={inputStyle} />
                    </div>
                </div>

                <div className="pt-4 border-t">
                     <label className="flex items-center gap-3 text-sm text-textPrimary cursor-pointer font-medium">
                        <input 
                            type="checkbox"
                            name="hasVariants"
                            checked={!!formData.hasVariants} 
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Este produto tem variações e personalizações
                     </label>
                </div>
                
                {formData.hasVariants && (
                    <ProductConfigurator 
                        attributes={formData.attributes || {}}
                        onAttributesChange={handleAttributesChange}
                        appData={appData}
                    />
                )}


                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Produto
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductDialog;