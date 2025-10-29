import { useState, useEffect, useMemo, useCallback } from 'react';
import { MarketingCampaign, MarketingSegment, MarketingTemplate, MarketingCampaignStatus, MarketingChannel } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export type MarketingFilters = {
    search: string;
    status: MarketingCampaignStatus[];
    channel: MarketingChannel[];
};

export function useMarketing() {
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [segments, setSegments] = useState<MarketingSegment[]>([]);
    const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [filters, setFilters] = useState<MarketingFilters>({ search: '', status: [], channel: [] });
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("[MARKETING] Loading tables...");
            const [campaignsData, segmentsData, templatesData] = await Promise.all([
                dataService.getMarketingCampaigns(),
                dataService.getMarketingSegments(),
                dataService.getMarketingTemplates(),
            ]);

            const loadedTables = [];
            const missingTables = [];

            if (Array.isArray(campaignsData)) {
                setCampaigns(campaignsData);
                loadedTables.push('marketing_campaigns');
            } else {
                missingTables.push('marketing_campaigns');
            }
            if (Array.isArray(segmentsData)) {
                setSegments(segmentsData);
                loadedTables.push('marketing_segments');
            } else {
                missingTables.push('marketing_segments');
            }
            if (Array.isArray(templatesData)) {
                setTemplates(templatesData);
                loadedTables.push('marketing_templates');
            } else {
                missingTables.push('marketing_templates');
            }
            
            console.log(`[MARKETING] Loaded tables: ${loadedTables.join(', ')}`);
            if (missingTables.length > 0) {
                 console.warn(`[MARKETING] Missing tables: ${missingTables.join(', ')}`);
            }

        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível carregar os dados de marketing.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(campaign => {
            const searchMatch = filters.search.length === 0 ||
                campaign.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                (campaign.description && campaign.description.toLowerCase().includes(filters.search.toLowerCase()));
            
            const statusMatch = filters.status.length === 0 || filters.status.includes(campaign.status);
            
            const channelMatch = filters.channel.length === 0 || filters.channel.some(ch => campaign.channels.includes(ch));

            return searchMatch && statusMatch && channelMatch;
        });
    }, [campaigns, filters]);

    const openDialog = (campaign: MarketingCampaign | null = null) => {
        setEditingCampaign(campaign);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setEditingCampaign(null);
        setIsDialogOpen(false);
    };
    
    const saveCampaign = async (campaignData: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at' | 'spent' | 'kpis'> | MarketingCampaign) => {
        setIsSaving(true);
        try {
            if ('id' in campaignData && campaignData.id) {
                await dataService.updateDocument('marketing_campaigns', campaignData.id, campaignData);
                toast({ title: "Sucesso!", description: `Campanha "${campaignData.name}" atualizada.` });
                 console.log(`[MARKETING] Campaign updated: ${campaignData.name} → ${campaignData.status}`);
            } else {
                const newCampaignData: Omit<MarketingCampaign, 'id'> = {
                    ...(campaignData as Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at' | 'spent' | 'kpis'>),
                    spent: 0,
                    kpis: { sent: 0, delivered: 0, read: 0, clicked: 0, replies: 0, orders: 0, revenue: 0 },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                await dataService.addDocument('marketing_campaigns', newCampaignData);
                toast({ title: "Sucesso!", description: "Nova campanha criada." });
            }
            loadData();
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar a campanha.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isSaving,
        campaigns,
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
    };
}
