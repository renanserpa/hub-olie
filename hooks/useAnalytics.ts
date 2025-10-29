import { useState, useEffect, useCallback } from 'react';
import { AnalyticsKPI, AnalyticsModule } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useAnalytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [kpis, setKpis] = useState<AnalyticsKPI[]>([]);
    const [activeTab, setActiveTab] = useState<AnalyticsModule>('overview');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const kpisData = await dataService.getCollection<AnalyticsKPI>('analytics_kpis');
            if (Array.isArray(kpisData)) {
                setKpis(kpisData);
                console.log('[ANALYTICS] Loaded tables: analytics_kpis');
            } else {
                console.warn('[ANALYTICS] Missing tables: analytics_kpis');
                setKpis([]); // Resilient
            }
        } catch (error) {
            toast({ title: "Erro de Analytics", description: "Não foi possível carregar os KPIs.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        isLoading,
        kpis,
        activeTab,
        setActiveTab,
    };
}
