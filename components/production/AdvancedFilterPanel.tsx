import React from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product, ProductionOrderStatus } from '../../types';
import { toast } from '../../hooks/use-toast';
import { Download, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdvancedFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: any;
    onFiltersChange: (filters: any) => void;
    onClearFilters: () => void;
    products: Product[];
}

const statusOptions: { value: ProductionOrderStatus, label: string }[] = [
    { value: 'novo', label: 'Nova' },
    { value: 'planejado', label: 'Planejada' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'em_espera', label: 'Em Espera' },
    { value: 'finalizado', label: 'Finalizada' },
    { value: 'cancelado', label: 'Cancelada' },
];

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({ 
    isOpen, onClose, filters, onFiltersChange, onClearFilters, products 
}) => {
    
    const handleInputChange = (field: string, value: any) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const handleStatusChange = (status: ProductionOrderStatus) => {
        const currentStatus = filters.status || [];
        const newStatus = currentStatus.includes(status)
            ? currentStatus.filter((s: string) => s !== status)
            : [...currentStatus, status];
        handleInputChange('status', newStatus);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Filtros Avançados de Produção"
            className="bg-gray-800 text-gray-200 border-gray-700 max-w-lg"
        >
            <div className="space-y-4 text-sm">
                 <div>
                    <label className="font-medium">Status da OP</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {statusOptions.map(opt => (
                            <label key={opt.value} className={cn("flex items-center gap-2 p-2 border rounded-md cursor-pointer", (filters.status || []).includes(opt.value) ? "bg-primary/20 border-primary" : "border-gray-600 hover:bg-gray-700")}>
                                <input 
                                    type="checkbox" 
                                    checked={(filters.status || []).includes(opt.value)} 
                                    onChange={() => handleStatusChange(opt.value)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-primary focus:ring-primary"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="font-medium">Produto Associado</label>
                    <select value={filters.productId || ''} onChange={e => handleInputChange('productId', e.target.value)} className="w-full mt-1 p-2 bg-gray-700 border-gray-600 rounded-md">
                        <option value="">Todos os produtos</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="font-medium">Período da OP</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <input type="date" value={filters.startDate || ''} onChange={e => handleInputChange('startDate', e.target.value)} className="p-2 bg-gray-700 border-gray-600 rounded-md" />
                        <input type="date" value={filters.endDate || ''} onChange={e => handleInputChange('endDate', e.target.value)} className="p-2 bg-gray-700 border-gray-600 rounded-md" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="font-medium">Quantidade Produzida</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="number" placeholder="Mín." value={filters.minQty || ''} onChange={e => handleInputChange('minQty', e.target.value)} className="p-2 bg-gray-700 border-gray-600 rounded-md" />
                            <input type="number" placeholder="Máx." value={filters.maxQty || ''} onChange={e => handleInputChange('maxQty', e.target.value)} className="p-2 bg-gray-700 border-gray-600 rounded-md" />
                        </div>
                    </div>
                     <div>
                        <label className="font-medium">Custo Estimado (R$)</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="number" placeholder="Mín." disabled className="p-2 bg-gray-900 border-gray-700 rounded-md cursor-not-allowed" title="Em breve" />
                            <input type="number" placeholder="Máx." disabled className="p-2 bg-gray-900 border-gray-700 rounded-md cursor-not-allowed" title="Em breve" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                 <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => toast({title: 'Em breve!', description: 'A exportação para planilhas será implementada em breve.'})}>
                    <Download size={16} className="mr-2"/>
                    Exportar para Planilhas
                 </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClearFilters}>Limpar Filtros</Button>
                    <Button onClick={onClose}>Aplicar Filtros</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AdvancedFilterPanel;