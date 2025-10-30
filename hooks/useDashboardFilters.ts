import { useState } from 'react';
import { AnalyticsModule } from '../types';

export type TimeRange = '7d' | '30d' | 'all';

export function useDashboardFilters(initialModule: AnalyticsModule) {
    const [activeTab, setActiveTab] = useState<AnalyticsModule>(initialModule);
    const [timeRange, setTimeRange] = useState<TimeRange>('all');

    return {
        activeTab,
        setActiveTab,
        timeRange,
        setTimeRange,
    };
}
