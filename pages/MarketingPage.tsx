import React from 'react';
import { useMarketing } from '../hooks/useMarketing';
import { Button } from '../components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import CampaignDialog from '../components/marketing/CampaignDialog';
import MarketingTabs from '../components/marketing/MarketingTabs';
import CampaignFilters from '../components/marketing/CampaignFilters';
import SegmentDialog from '../components/marketing/SegmentDialog';

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
        isSegmentDialogOpen,
        editingSegment,
        openSegmentDialog,
        closeSegmentDialog,
        saveSegment,
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
                onNewSegment={() => openSegmentDialog()}
                onEditSegment={openSegmentDialog}
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

            {isSegmentDialogOpen && (
                <SegmentDialog
                    isOpen={isSegmentDialogOpen}
                    onClose={closeSegmentDialog}
                    onSave={saveSegment}
                    segment={editingSegment}
                />
            )}
        </div>
    );
};

export default MarketingPage;