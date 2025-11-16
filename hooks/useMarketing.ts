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

    const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
    const [editingSegment, setEditingSegment] = useState<MarketingSegment | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const campaignsListener = dataService.listenToCollection('marketing_campaigns', undefined, (data) => {
            setCampaigns(data as MarketingCampaign[]);
            setIsLoading(false);
        }, setCampaigns);
        const segmentsListener = dataService.listenToCollection('marketing_segments', undefined, (data) => {
            setSegments(data as MarketingSegment[]);
        }, setSegments);
        const templatesListener = dataService.listenToCollection('marketing_templates', undefined, (data) => {
            setTemplates(data as MarketingTemplate[]);
        }, setTemplates);

        return () => {
            campaignsListener.unsubscribe();
            segmentsListener.unsubscribe();
            templatesListener.unsubscribe();
        }
    }, []);
    
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
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar a campanha.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const openSegmentDialog = (segment: MarketingSegment | null = null) => {
        setEditingSegment(segment);
        setIsSegmentDialogOpen(true);
    };
    
    const closeSegmentDialog = () => {
        setEditingSegment(null);
        setIsSegmentDialogOpen(false);
    };

    const saveSegment = async (segmentData: Omit<MarketingSegment, 'id' | 'audience_size'> | MarketingSegment) => {
        setIsSaving(true);
        try {
            if ('id' in segmentData && segmentData.id) {
                await dataService.updateDocument('marketing_segments', segmentData.id, segmentData);
                toast({ title: "Sucesso!", description: `Segmento "${segmentData.name}" atualizado.` });
            } else {
                await dataService.addDocument('marketing_segments', segmentData as Omit<MarketingSegment, 'id'>);
                toast({ title: "Sucesso!", description: "Novo segmento criado." });
            }
            closeSegmentDialog();
        } catch(e) {
             toast({ title: "Erro!", description: "Não foi possível salvar o segmento.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const _saveTemplate = async (templateData: Omit<MarketingTemplate, 'id'> | MarketingTemplate) => {
        setIsSaving(true);
        try {
             if ('id' in templateData && templateData.id) {
                await dataService.updateDocument('marketing_templates', templateData.id, templateData);
                toast({ title: "Sucesso!", description: `Template "${templateData.name}" atualizado.` });
            } else {
                await dataService.addDocument('marketing_templates', templateData as Omit<MarketingTemplate, 'id'>);
                toast({ title: "Sucesso!", description: "Novo template criado." });
            }
        } catch(e) {
            toast({ title: "Erro!", description: "Não foi possível salvar o template.", variant: "destructive" });
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
        isSegmentDialogOpen,
        editingSegment,
        openSegmentDialog,
        closeSegmentDialog,
        saveSegment,
    };
}
