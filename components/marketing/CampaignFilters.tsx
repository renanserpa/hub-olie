import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { MarketingFilters } from '../../hooks/useMarketing';

interface CampaignFiltersProps {
    filters: MarketingFilters;
    onFiltersChange: (filters: MarketingFilters) => void;
    onNewCampaignClick: () => void;
}

const CampaignFilters: React.FC<CampaignFiltersProps> = ({ filters, onFiltersChange, onNewCampaignClick }) => {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({ ...filters, search: e.target.value });
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
             <div>
                <h1 className="text-3xl font-bold text-textPrimary">Marketing</h1>
                <p className="text-textSecondary mt-1">Gerencie campanhas, segmente públicos e analise resultados.</p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="relative flex-1 sm:flex-initial sm:w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-textSecondary" />
                    </div>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={handleSearchChange}
                        placeholder="Buscar campanha..."
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <Button onClick={onNewCampaignClick}><Plus className="w-4 h-4 mr-2" />Nova Campanha</Button>
            </div>
        </div>
    );
};

export default CampaignFilters;
