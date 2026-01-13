import React from 'react';
import { Insight } from './useDashboard';
import { cn } from '../../lib/utils';
import { AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

const insightConfig = {
    risk: { icon: AlertTriangle, className: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
    opportunity: { icon: Lightbulb, className: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
    positive: { icon: CheckCircle, className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
};

export default function DashboardAIInsights({ insights }: { insights: Insight[] }) {
  if (!insights?.length) return null;
  return (
    <section className="p-4 bg-card dark:bg-dark-card border rounded-lg">
      <h2 className="text-md font-semibold mb-3">Insights da IA Executiva</h2>
      <ul className="space-y-2 text-sm">
        {insights.map((i: Insight) => {
            const config = insightConfig[i.type] || insightConfig.positive;
            const Icon = config.icon;
            return (
              <li key={i.id} className={cn('p-3 rounded-md flex items-start gap-3', config.className)}>
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                <span>{i.insight}</span>
              </li>
            )
        })}
      </ul>
    </section>
  );
}
