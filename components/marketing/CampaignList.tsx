import React from 'react';
import { MarketingCampaign } from '../../types';
import CampaignCard from './CampaignCard';
import { Loader2 } from 'lucide-react';
import EmptyState from './EmptyState';

interface CampaignListProps {
    campaigns: MarketingCampaign[];
    isLoading: boolean;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, isLoading }) => {
    if (isLoading) {
        return (
            <div className="text-center py-10 flex items-center justify-center gap-2 text-textSecondary">
                <Loader2 className="h-5 w-5 animate-spin"/> Carregando campanhas...
            </div>
        );
    }

    if (campaigns.length === 0) {
        return <EmptyState title="Nenhuma Campanha" message="Crie sua primeira campanha para começar a engajar seus clientes." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </div>
    );
};

export default CampaignList;
