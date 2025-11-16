import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
// FIX: Added Order to imports
import type { Contact, Product, OrderItem, ConfigJson, AppData, Order } from '../types';
import { dataService } from '../services/dataService';
import { toast } from '../hooks/use-toast';
import { Plus, Trash2, Settings, Loader2 } from 'lucide-react';
import CustomizeItemDialog from './CustomizeItemDialog';

interface OrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    contacts: Contact[];
    products: Product[];
}

const OrderDialog: React.FC<OrderDialogProps> = ({ isOpen, onClose, onSave, contacts, products }) => {
    const [contactId, setContactId] = useState('');
    const [items, setItems] = useState<Partial<OrderItem>[]>([]);
    const [discount, setDiscount] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customizingItemIndex, setCustomizingItemIndex] = useState<number | null>(null);
    const [appData, setAppData] = useState<AppData | null>(null);
    
    useEffect(() => {
        if(isOpen) {
            dataService.getSettings().then(setAppData);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setContactId('');
            setItems([]);
            setDiscount(0);
            setShippingCost(0);
            setNotes('');
        }
    }, [isOpen]);
    
    const handleAddItem = () => {
        setItems([...items, { product_id: '', quantity: 1, unit_price: 0, total: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
    
    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            item.product_id = value;
            item.product_name = product?.name;
            item.unit_price = product?.base_price || 0;
            item.product = product;
            item.config_json = {}; // Reset config when product changes
        } else {
            // This line updates a dynamic key on a typed object; prefer @ts-expect-error so eslint/TS rules are explicit
            // @ts-expect-error -- assigning to a dynamic OrderItem field
            item[field] = value;
        }
        
        item.total = (item.quantity || 0) * (item.unit_price || 0);
        setItems(newItems);
    };
    
    const handleCustomizationSave = (data: { config: Record<string, any>, variantName: string, finalPrice: number }) => {
        if (customizingItemIndex !== null) {
            const newItems = [...items];
            const item = newItems[customizingItemIndex];
            
            item.config_json = data.config;
            item.product_name = data.variantName;
            item.unit_price = data.finalPrice;
            item.total = (item.quantity || 1) * data.finalPrice;

            setItems(newItems);
            setCustomizingItemIndex(null);
        }
    };
    
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const total = subtotal - discount + shippingCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactId || items.length === 0) {
            toast({ title: "Atenção", description: "Selecione um cliente e adicione pelo menos um item.", variant: 'destructive' });
            return;
        }
        
        setIsSubmitting(true);
        try {
            const newOrderData: Partial<Order> = {
                customer_id: contactId,
                items: items as OrderItem[],
                subtotal: subtotal,
                discounts: discount,
                shipping_fee: shippingCost,
                total: total,
                notes: notes,
                status: 'pending_payment',
                origin: 'Manual',
            };
            await dataService.addOrder(newOrderData);
            toast({ title: "Sucesso!", description: "Novo pedido criado." });
            onSave();
            onClose();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível criar o pedido.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const itemToCustomize = customizingItemIndex !== null ? items[customizingItemIndex] : null;
    const productToCustomize = itemToCustomize?.product;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Pedido" className="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-textSecondary">Cliente *</label>
                    <select value={contactId} onChange={e => setContactId(e.target.value)} required className="w-full mt-1 p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-primary/50">
                        <option value="">Selecione um cliente</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <h3 className="text-md font-semibold">Itens do Pedido</h3>
                    <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg bg-secondary/50">
                                <div className="col-span-5">
                                    <select value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)} className="w-full text-sm p-1 border rounded-md bg-background">
                                        <option value="">Selecione um produto</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} className="w-full text-sm p-1 border rounded-md bg-background" />
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-sm">R$ {item.unit_price?.toFixed(2)}</span>
                                </div>
                                <div className="col-span-2 text-right font-semibold">
                                    <span className="text-sm">R$ {item.total?.toFixed(2)}</span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-1">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setCustomizingItemIndex(index)} disabled={!item.product?.configurable_parts} className="h-7 w-7 p-0">
                                        <Settings size={14} />
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)} className="h-7 w-7 p-0 text-red-500">
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddItem}>
                        <Plus className="w-3 h-3 mr-2" /> Adicionar Item
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                     <div>
                        <label className="block text-sm font-medium text-textSecondary">Desconto (R$)</label>
                        <input type="number" step="0.01" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded-md bg-background" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-textSecondary">Frete (R$)</label>
                        <input type="number" step="0.01" value={shippingCost} onChange={e => setShippingCost(parseFloat(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded-md bg-background" />
                    </div>
                     <div className="text-right">
                        <p className="text-sm text-textSecondary">Total</p>
                        <p className="font-bold text-2xl">R$ {total.toFixed(2)}</p>
                    </div>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-textSecondary">Notas Internas</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full mt-1 p-2 border rounded-md bg-background" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Pedido
                    </Button>
                </div>
            </form>
            
            {productToCustomize && appData && (
                 <CustomizeItemDialog
                    isOpen={customizingItemIndex !== null}
                    onClose={() => setCustomizingItemIndex(null)}
                    onSave={handleCustomizationSave}
                    initialConfig={itemToCustomize?.config_json || {}}
                    product={productToCustomize}
                    appData={appData}
                />
            )}
        </Modal>
    );
};

export default OrderDialog;
