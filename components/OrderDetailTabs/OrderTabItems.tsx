import React, { useState } from 'react';
import { Order, Product, ConfigJson } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Loader2, Palette } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface OrderTabItemsProps {
    order: Order;
    allProducts: Product[];
    addItemToOrder: (orderId: string, itemData: { product_id: string; quantity: number }) => Promise<void>;
    isSaving: boolean;
}

const ConfigDisplay: React.FC<{ config: ConfigJson }> = ({ config }) => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textSecondary mt-1">
        {config.fabricColor && <span>Tecido: {config.fabricColor}</span>}
        {config.zipperColor && <span>Zíper: {config.zipperColor}</span>}
        {config.embroidery?.enabled && <span>Bordado: "{config.embroidery.text}"</span>}
    </div>
);

const OrderTabItems: React.FC<OrderTabItemsProps> = ({ order, allProducts, addItemToOrder, isSaving }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newProductId, setNewProductId] = useState('');
    const [newQuantity, setNewQuantity] = useState(1);

    const handleAddItem = async () => {
        if (!newProductId || newQuantity <= 0) {
            toast({ title: "Atenção", description: "Selecione um produto e uma quantidade válida.", variant: 'destructive' });
            return;
        }
        await addItemToOrder(order.id, { product_id: newProductId, quantity: newQuantity });
        setIsAdding(false);
        setNewProductId('');
        setNewQuantity(1);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {order.items.map(item => (
                    <div key={item.id} className="p-3 border rounded-lg bg-secondary/50">
                        <div className="flex justify-between font-medium">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span>R$ {item.total.toFixed(2)}</span>
                        </div>
                        {item.config_json && <ConfigDisplay config={item.config_json} />}
                    </div>
                ))}
            </div>
            
            <div className="border-t pt-4">
                {!isAdding ? (
                    <Button variant="outline" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                    </Button>
                ) : (
                    <div className="p-4 border rounded-lg bg-secondary/50 space-y-3 animate-fade-in-up">
                        <h4 className="font-semibold text-textPrimary">Novo Item</h4>
                        <div className="grid grid-cols-3 gap-4 items-end">
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-textSecondary">Produto</label>
                                <select value={newProductId} onChange={e => setNewProductId(e.target.value)} required className="w-full text-sm mt-1 p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/50">
                                    <option value="">Selecione...</option>
                                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-textSecondary">Quantidade</label>
                                <input type="number" value={newQuantity} onChange={e => setNewQuantity(parseInt(e.target.value) || 1)} min="1" required className="w-full text-sm mt-1 p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/50" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancelar</Button>
                            <Button size="sm" onClick={handleAddItem} disabled={isSaving}>
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Salvar Item
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTabItems;
