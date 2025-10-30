import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SystemHealthCardProps {
  score: number;
  status: 'Operational' | 'Degraded' | 'Critical';
}

const statusConfig = {
  Operational: { icon: ShieldCheck, color: 'text-green-500', label: 'Todos os sistemas operacionais' },
  Degraded: { icon: ShieldAlert, color: 'text-yellow-500', label: 'Performance degradada' },
  Critical: { icon: ShieldX, color: 'text-red-500', label: 'Falha crítica em um ou mais sistemas' },
};

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ score, status }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">System Health</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-secondary dark:text-dark-secondary"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
            <path
              className={cn("transition-all duration-500", config.color)}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-xs text-textSecondary">Health Score</span>
          </div>
        </div>
        <div className={cn("flex items-center justify-center gap-2 mt-4 font-semibold", config.color)}>
            <Icon size={18} />
            <span>{config.label}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
