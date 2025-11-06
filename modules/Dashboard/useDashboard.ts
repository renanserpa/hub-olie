import { useState, useEffect, useCallback } from 'react';
import { getData } from '../../services/bridge/olieBridgeService';
import { generateExecutiveInsight } from '../../services/ai/olieAIService';
import { log } from '../../lib/logger';
import { useApp } from '../../contexts/AppContext';
import { useOlie } from '../../contexts/OlieContext';
import { AnalyticsKPI, AIInsight as ExecutiveInsightType } from '../../types';

export interface KPI {
  id: string;
  module: string;
  name: string;
  value: number;
  trend: number;
  unit?: string;
  description?: string;
}

export interface Insight {
  id: string;
  type: 'opportunity' | 'positive' | 'risk';
  insight: string;
  module: string;
}

export interface DashboardData {
  kpis: KPI[];
  insights: Insight[];
  systemStatus: {
    env: string;
    lastSync: string | null;
    supabaseConnected: boolean;
  };
}

export function useDashboard() {
  const { user } = useApp();
  const { can } = useOlie();
  const [data, setData] = useState<DashboardData>({
    kpis: [],
    insights: [],
    systemStatus: { env: 'SANDBOX', lastSync: null, supabaseConnected: true },
  });
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!can('Dashboard', 'read')) {
        log.warn('Acesso negado ao Dashboard.');
        setLoading(false);
        return;
    }
    setLoading(true);
    log.info('[Dashboard] Carregando KPIs e insights...');

    try {
        const kpisData = await getData('analytics_kpis') as AnalyticsKPI[];
        const insightsData = await getData('executive_ai_insights') as ExecutiveInsightType[];
        
        await generateExecutiveInsight({ kpis: kpisData.map(k => ({...k, value: Number(k.value)} as KPI)) });

        setData({
          kpis: kpisData.map(k => ({...k, value: Number(k.value)} as KPI)),
          insights: insightsData,
          systemStatus: {
            env: 'SANDBOX',
            lastSync: new Date().toISOString(),
            supabaseConnected: true,
          },
        });

        log.info('[Dashboard] Dados carregados com sucesso.');
    } catch (error) {
        log.error('[Dashboard] Erro ao carregar dados:', error);
    } finally {
        setLoading(false);
    }
  }, [can, user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { data, loading, reload: loadDashboard };
}