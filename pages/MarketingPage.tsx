import React from 'react';
import { useMarketing } from '../hooks/useMarketing';
import { Button } from '../components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import CampaignDialog from '../components/marketing/CampaignDialog';
import MarketingTabs from '../components/marketing/MarketingTabs';
import CampaignFilters from '../components/marketing/CampaignFilters';

const MarketingPage: React.FC = () => {
    const {
        isLoading,
        filteredCampaigns,
        segments,
        templates,
        isDialogOpen,
        editingCampaign,
        openDialog,
        closeDialog,
        saveCampaign,
        filters,
        setFilters,
    } = useMarketing();

    return (
        <div>
            <CampaignFilters 
                filters={filters}
                onFiltersChange={setFilters}
                onNewCampaignClick={() => openDialog()}
            />
            
            <MarketingTabs 
                campaigns={filteredCampaigns}
                segments={segments}
                templates={templates}
                isLoading={isLoading}
            />

            {isDialogOpen && (
                <CampaignDialog
                    isOpen={isDialogOpen}
                    onClose={closeDialog}
                    onSave={saveCampaign}
                    campaign={editingCampaign}
                    segments={segments}
                    templates={templates}
                />
            )}
        </div>
    );
};

export default MarketingPage;