import React from 'react';
import { InitializerAgent } from '../../types';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface AgentStatusCardProps {
  agent: InitializerAgent;
}

const statusConfig = {
    idle: { label: 'Ocioso', color: 'bg-green-500' },
    working: { label: 'Trabalhando', color: 'bg-blue-500' },
    error: { label: 'Erro', color: 'bg-red-500' },
    offline: { label: 'Offline', color: 'bg-gray-400' },
};

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ agent }) => {
    const config = statusConfig[agent.status];
    const timeAgo = formatDistanceToNow(new Date(agent.last_heartbeat), { addSuffix: true, locale: ptBR });

    return (
        <div className="p-3 border rounded-lg flex items-center gap-4 bg-background dark:bg-dark-background">
            <div className="relative">
                <span className={cn("block w-3 h-3 rounded-full", config.color)}></span>
                {agent.status === 'working' && <span className={cn("absolute inset-0 block w-3 h-3 rounded-full animate-ping", config.color)}></span>}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-sm">{agent.name}</p>
                <p className="text-xs text-textSecondary">{agent.role}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-medium capitalize">{config.label}</p>
                <p className="text-xs text-textSecondary">{timeAgo}</p>
            </div>
        </div>
    );
};

export default AgentStatusCard;
