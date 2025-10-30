import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnalyticsKPI, AnalyticsModule, AnalyticsSnapshot } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useAnalytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [kpis, setKpis] = useState<AnalyticsKPI[]>([]);
    const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
    const [activeTab, setActiveTab] = useState<AnalyticsModule>('overview');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [kpisData, snapshotsData] = await Promise.all([
                dataService.getCollection<AnalyticsKPI>('analytics_kpis'),
                dataService.getCollection<AnalyticsSnapshot>('analytics_snapshots'),
            ]);

            if (Array.isArray(kpisData)) {
                setKpis(kpisData);
                console.log('[ANALYTICS] Loaded tables: analytics_kpis');
            } else {
                console.warn('[ANALYTICS] Missing tables: analytics_kpis');
                setKpis([]); // Resilient
            }

            if (Array.isArray(snapshotsData)) {
                setSnapshots(snapshotsData);
                console.log('[ANALYTICS] Loaded tables: analytics_snapshots');
            } else {
                console.warn('[ANALYTICS] Missing tables: analytics_snapshots');
                setSnapshots([]); // Resilient
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

    const kpisByModule = useMemo(() => {
        return kpis.reduce((acc, kpi) => {
            if (!acc[kpi.module]) {
                acc[kpi.module] = [];
            }
            acc[kpi.module].push(kpi);
            return acc;
        }, {} as Record<AnalyticsModule, AnalyticsKPI[]>);
    }, [kpis]);
    
    const snapshotsByKpi = useMemo(() => {
        return snapshots.reduce((acc, snapshot) => {
            if (!acc[snapshot.kpi_id]) {
                acc[snapshot.kpi_id] = [];
            }
            acc[snapshot.kpi_id].push(snapshot);
            return acc;
        }, {} as Record<string, AnalyticsSnapshot[]>);
    }, [snapshots]);


    return {
        isLoading,
        kpis,
        snapshots,
        activeTab,
        setActiveTab,
        kpisByModule,
        snapshotsByKpi,
    };
}