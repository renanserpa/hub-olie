import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Contact, Product, OrderItem, ConfigJson, AppData } from '../types';
import { supabaseService } from '../services/firestoreService';
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
    // Form state
    const [contactId, setContactId] = useState('');
    const [items, setItems] = useState<Partial<OrderItem>[]>([]);
    const [discount, setDiscount] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Customization dialog state
    const [customizingItemIndex, setCustomizingItemIndex] = useState<number | null>(null);

    // This is a temporary workaround to fetch full appData for customization.
    // In a future refactor, CustomizeItemDialog should fetch its own needed data.
    const [appData, setAppData] = useState<AppData | null>(null);
    useEffect(() => {
        if(isOpen) {
            supabaseService.getSettings().then(setAppData);
        }
    }, [isOpen]);


    useEffect(() => {
        if (!isOpen) {
            // Reset form on close
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
            item.unit_price = product?.basePrice || 0;
            item.product = product;
        } else {
            // @ts-ignore
            item[field] = value;
        }
        
        item.total = (item.quantity || 0) * (item.unit_price || 0);
        setItems(newItems);
    };
    
    const handleCustomizationSave = (config: ConfigJson) => {
        if (customizingItemIndex !== null) {
            const newItems = [...items];
            newItems[customizingItemIndex].config_json = config;
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
            await supabaseService.addOrder({
                contact_id: contactId,
                items: items.map(({ product, ...item }) => item) as OrderItem[], // Remove temporary product object before saving
                status: 'pending_payment',
                subtotal,
                discount,
                shipping_cost: shippingCost,
                total,
                notes,
                source: 'manual',
            });
            toast({ title: "Sucesso!", description: "Novo pedido criado." });
            onSave();
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível criar o pedido.", variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const itemToCustomize = customizingItemIndex !== null ? items[customizingItemIndex] : null;

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Pedido">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-textSecondary">Cliente</label>
                    <select value={contactId} onChange={e => setContactId(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="">Selecione um cliente</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <h3 className="text-md font-semibold text-textPrimary mb-2">Itens</h3>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 border rounded-lg bg-secondary/50">
                                <div className="col-span-5">
                                    <label className="text-xs font-medium text-textSecondary">Produto</label>
                                    <select value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)} required className="w-full text-sm p-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/50">
                                        <option value="">Selecione</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-textSecondary">Qtd</label>
                                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} min="1" required className="w-full text-sm p-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/50" />
                                </div>
                                <div className="col-span-3 text-right">
                                    <p className="text-xs text-textSecondary">Total</p>
                                    <p className="text-sm font-medium">R$ {item.total?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="col-span-2 flex items-center justify-end gap-1">
                                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setCustomizingItemIndex(index)} disabled={!item.product_id}><Settings size={14}/></Button>
                                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleRemoveItem(index)}><Trash2 size={14}/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddItem}><Plus className="w-3 h-3 mr-2" />Adicionar Item</Button>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <div>
                        <label className="block text-sm font-medium text-textSecondary">Subtotal</label>
                        <p className="font-semibold text-lg">R$ {subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <label htmlFor="discount" className="block text-sm font-medium text-textSecondary">Desconto (R$)</label>
                        <input id="discount" type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                     <div>
                        <label htmlFor="shippingCost" className="block text-sm font-medium text-textSecondary">Frete (R$)</label>
                        <input id="shippingCost" type="number" value={shippingCost} onChange={e => setShippingCost(parseFloat(e.target.value) || 0)} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                </div>

                 <div className="text-right">
                    <p className="text-sm text-textSecondary">Total do Pedido</p>
                    <p className="font-bold text-2xl text-primary">R$ {total.toFixed(2)}</p>
                 </div>
                 
                 <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Pedido
                    </Button>
                </div>
            </form>
        </Modal>
        {itemToCustomize && itemToCustomize.product && appData && (
             <CustomizeItemDialog
                isOpen={customizingItemIndex !== null}
                onClose={() => setCustomizingItemIndex(null)}
                onSave={handleCustomizationSave}
                initialConfig={itemToCustomize.config_json || {}}
                product={itemToCustomize.product}
                appData={appData}
            />
        )}
        </>
    );
};

export default OrderDialog;