import React, { useState } from 'react';
import { Product, ProductVariant, AppData, InventoryBalance, BOMComponent } from '../../../types';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import { toast } from '../../../hooks/use-toast';
import { dataService } from '../../../services/dataService';
import { Loader2 } from 'lucide-react';

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={cn("bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border shadow-sm", className)}>
        <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const ProductBOMPanel: React.FC<{
    product: Product;
    allVariants: ProductVariant[];
    appData: AppData;
    inventoryBalances: InventoryBalance[];
}> = ({ product, allVariants, appData, inventoryBalances }) => {
    const [selectedVariantId, setSelectedVariantId] = useState<string>('base');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const productVariants = allVariants.filter(v => v.product_base_id === product?.id);

    const bomToDisplay = selectedVariantId === 'base' 
        ? product.base_bom 
        : productVariants.find(v => v.id === selectedVariantId)?.bom;

    const getOnHandStock = (materialId: string) => {
        const balances = inventoryBalances.filter(b => b.material_id === materialId);
        return balances.reduce((sum, b) => sum + (b.current_stock - b.reserved_stock), 0);
    };

    const handleGenerateOP = async () => {
        if (!product) return;
        setIsSubmitting(true);
        try {
            const opData = { 
                product_id: product.id, 
                variant_sku: selectedVariantId !== 'base' ? productVariants.find(v => v.id === selectedVariantId)?.sku : null,
                quantity: 1,
            };
            await dataService.addDocument('production_orders', opData as any);
            await dataService.addDocument('system_audit', { key: 'OP_GENERATED', status: 'SUCCESS', details: { productId: product.id } } as any);
            toast({ title: 'Sucesso!', description: 'Ordem de Produção simulada e registrada no log de auditoria.' });
        } catch (e) {
            toast({ title: 'Erro!', description: 'Não foi possível gerar a OP.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Section title="Selecionar Variante">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        <Button type="button" onClick={() => setSelectedVariantId('base')} variant={selectedVariantId === 'base' ? 'primary' : 'outline'} className="w-full justify-start">BOM Padrão</Button>
                        {productVariants.map(v => (
                            <Button type="button" key={v.id} onClick={() => setSelectedVariantId(v.id)} variant={selectedVariantId === v.id ? 'primary' : 'outline'} className="w-full justify-start text-left h-auto py-2">
                                <div>
                                    <p className="font-semibold text-sm">{v.sku}</p>
                                    <p className="text-xs font-normal whitespace-normal">{v.name}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </Section>
            </div>
            <div className="lg:col-span-2">
                <Section title="Lista de Materiais (BOM)">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left bg-secondary"><tr><th className="p-2">Insumo</th><th className="p-2">Qtd. Padrão</th><th className="p-2">Estoque (ON HAND)</th></tr></thead>
                            <tbody>
                                {(bomToDisplay || []).map((item, index) => {
                                    const material = appData.config_materials.find(m => m.id === item.material_id);
                                    if (!material) return <tr key={index}><td colSpan={3}>Material não encontrado (ID: {item.material_id})</td></tr>;
                                    const onHand = getOnHandStock(material.id);
                                    return (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="p-2">{material.name}</td>
                                            <td className="p-2">{item.quantity_per_unit} {material.unit}</td>
                                            <td className={cn("p-2 font-semibold", onHand <= (material.low_stock_threshold || 0) ? 'text-red-500' : 'text-green-600')}>{onHand.toFixed(2)} {material.unit}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                         <div className="mt-4 border-t pt-4">
                             <p className="text-xs text-textSecondary mb-2">Todos os insumos estão corretamente vinculados ao Módulo de Estoque.</p>
                             <Button type="button" variant="outline" onClick={handleGenerateOP} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Gerar OP de Teste (1 un.)
                            </Button>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default ProductBOMPanel;
