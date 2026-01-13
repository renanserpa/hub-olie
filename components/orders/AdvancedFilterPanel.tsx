import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { AdvancedFilters } from '../../hooks/useOrders';
import { Contact, Product, OrderStatus } from '../../types';

interface AdvancedFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: AdvancedFilters;
    onFiltersChange: (filters: AdvancedFilters) => void;
    contacts: Contact[];
    products: Product[];
}

const statusOptions: { value: OrderStatus, label: string }[] = [
    { value: 'pending_payment', label: 'Aguard. Pagamento' }, { value: 'paid', label: 'Pago' },
    { value: 'in_production', label: 'Em Produção' }, { value: 'awaiting_shipping', label: 'Pronto p/ Envio' },
    { value: 'shipped', label: 'Enviado' }, { value: 'delivered', label: 'Entregue' }, { value: 'cancelled', label: 'Cancelado' }
];

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({ isOpen, onClose, filters, onFiltersChange, contacts, products }) => {
    const handleInputChange = (field: keyof AdvancedFilters, value: any) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const handleStatusChange = (status: OrderStatus) => {
        const newStatus = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status];
        handleInputChange('status', newStatus);
    };
    
    const clearFilters = () => {
        onFiltersChange({ startDate: '', endDate: '', customerIds: [], status: [], minValue: '', maxValue: '', productId: '' });
    };

    return (
        <div
            className={cn("fixed inset-0 bg-black/60 z-40 transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        >
            <div
                className={cn("fixed top-0 right-0 h-full w-full max-w-sm bg-card shadow-lg flex flex-col transition-transform duration-300", isOpen ? "translate-x-0" : "translate-x-full")}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><SlidersHorizontal size={18}/> Filtros Avançados</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Período</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="date" value={filters.startDate} onChange={e => handleInputChange('startDate', e.target.value)} className="p-2 border rounded-md" />
                            <input type="date" value={filters.endDate} onChange={e => handleInputChange('endDate', e.target.value)} className="p-2 border rounded-md" />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Cliente</label>
                        <select value={filters.customerIds[0] || ''} onChange={e => handleInputChange('customerIds', e.target.value ? [e.target.value] : [])} className="w-full p-2 border rounded-md mt-1">
                            <option value="">Todos os clientes</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {statusOptions.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 text-xs p-1 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50">
                                    <input type="checkbox" checked={filters.status.includes(opt.value)} onChange={() => handleStatusChange(opt.value)} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Produto</label>
                        <select value={filters.productId} onChange={e => handleInputChange('productId', e.target.value)} className="w-full p-2 border rounded-md mt-1">
                            <option value="">Todos os produtos</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Valor do Pedido (R$)</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="number" placeholder="Mínimo" value={filters.minValue} onChange={e => handleInputChange('minValue', e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2 border rounded-md" />
                            <input type="number" placeholder="Máximo" value={filters.maxValue} onChange={e => handleInputChange('maxValue', e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2 border rounded-md" />
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-border flex justify-between items-center">
                    <Button variant="ghost" onClick={clearFilters} className="text-sm">Limpar Filtros</Button>
                    <Button onClick={onClose} className="text-sm">Aplicar</Button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilterPanel;