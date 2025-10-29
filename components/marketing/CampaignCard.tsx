import React from 'react';
import { MarketingCampaign, MarketingCampaignStatus, MarketingChannel } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Play, Pause, X, Mail, MessageSquare, AtSign, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CampaignCardProps {
    campaign: MarketingCampaign;
}

const statusConfig: Record<MarketingCampaignStatus, { label: string, color: string }> = {
    draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
    scheduled: { label: 'Agendada', color: 'bg-blue-100 text-blue-800' },
    active: { label: 'Ativa', color: 'bg-green-100 text-green-800' },
    paused: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Concluída', color: 'bg-purple-100 text-purple-800' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

const channelIcons: Record<MarketingChannel, React.ElementType> = {
    email: Mail,
    sms: MessageSquare,
    whatsapp: AtSign,
    instagram: Send,
};

const KPI: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-sm font-bold text-textPrimary">{value}</p>
        <p className="text-xs text-textSecondary">{label}</p>
    </div>
);

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
    const status = statusConfig[campaign.status];
    const roi = campaign.spent > 0 ? ((campaign.kpis.revenue - campaign.spent) / campaign.spent) * 100 : 0;
    
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                        {campaign.channels.map(channel => {
                            const Icon = channelIcons[channel];
                            return <Icon key={channel} size={16} className="text-textSecondary" title={channel} />;
                        })}
                    </div>
                </div>
                <Badge className={cn('text-xs', status.color)}>{status.label}</Badge>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <p className="text-sm text-textSecondary mb-4 flex-grow">{campaign.description || 'Sem descrição.'}</p>
                
                <div className="grid grid-cols-4 gap-2 py-4 border-t border-b">
                    <KPI label="Enviados" value={campaign.kpis.sent} />
                    <KPI label="Aberturas" value={`${campaign.kpis.delivered > 0 ? ((campaign.kpis.read / campaign.kpis.delivered) * 100).toFixed(1) : 0}%`} />
                    <KPI label="Cliques" value={`${campaign.kpis.read > 0 ? ((campaign.kpis.clicked / campaign.kpis.read) * 100).toFixed(1) : 0}%`} />
                    <KPI label="ROI" value={`${roi.toFixed(1)}%`} />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                    {['draft', 'paused'].includes(campaign.status) && <Button variant="ghost" size="sm"><Play size={14} className="mr-1"/> Iniciar</Button>}
                    {campaign.status === 'active' && <Button variant="ghost" size="sm"><Pause size={14} className="mr-1"/> Pausar</Button>}
                    {['draft', 'scheduled', 'paused'].includes(campaign.status) && <Button variant="ghost" size="sm" className="text-red-600"><X size={14} className="mr-1"/> Cancelar</Button>}
                </div>
            </CardContent>
        </Card>
    );
};

export default CampaignCard;
