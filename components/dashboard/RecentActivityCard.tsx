import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ActivityItem } from '../../types';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

interface ActivityFeedCardProps {
    title: string;
    activities: ActivityItem[];
    onViewAllClick?: () => void;
}

const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ title, activities, onViewAllClick }) => {
    return (
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                {onViewAllClick && <Button variant="ghost" size="sm" onClick={onViewAllClick}>Ver Todos <ArrowRight className="w-4 h-4 ml-2"/></Button>}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length > 0 ? activities.map(item => {
                        const Icon = item.icon;
                        return (
                            <div key={item.id} className="flex items-center animate-fade-in-up">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.title}</p>
                                    <p className="text-sm text-textSecondary">{item.description}</p>
                                </div>
                                <div className="ml-auto font-medium text-right">
                                    {item.value && <p>{item.value}</p>}
                                    <p className="text-xs text-textSecondary font-normal">{new Date(item.timestamp).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-sm text-center text-textSecondary py-8">Nenhuma atividade recente no sistema.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ActivityFeedCard;