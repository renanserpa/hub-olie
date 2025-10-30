import { useState, useEffect, useCallback } from 'react';
import { ExecutiveKPI, AIInsight, ExecutiveModule } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useExecutiveDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [activeTab, setActiveTab] = useState<ExecutiveModule>('overview');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [kpisData, insightsData] = await Promise.all([
                dataService.getCollection<ExecutiveKPI>('executive_kpis'),
                dataService.getCollection<AIInsight>('executive_ai_insights'),
            ]);

            if (Array.isArray(kpisData)) {
                setKpis(kpisData);
                console.log('[EXECUTIVE] Loaded tables: executive_kpis');
            } else {
                setKpis([]);
                console.warn('[EXECUTIVE] Missing tables: executive_kpis');
            }

            if (Array.isArray(insightsData)) {
                setInsights(insightsData);
                console.log('[EXECUTIVE] Loaded tables: executive_ai_insights');
            } else {
                setInsights([]);
                console.warn('[EXECUTIVE] Missing tables: executive_ai_insights');
            }

        } catch (error) {
            toast({ title: "Erro no Dashboard", description: "Não foi possível carregar os dados executivos.", variant: "destructive" });
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
        insights,
        activeTab,
        setActiveTab,
    };
}