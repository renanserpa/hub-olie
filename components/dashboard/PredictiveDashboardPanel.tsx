import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAnalyticsAI } from '../../hooks/useAnalyticsAI';
import AnalyticsDashboard from '../executive/AnalyticsDashboard';
import { Loader2 } from 'lucide-react';

const PredictiveDashboardPanel: React.FC = () => {
    const { kpis, snapshotsByKpi, isLoading } = useAnalytics();
    const { isAiLoading, anomalies, predictions, forecasts } = useAnalyticsAI(kpis, snapshotsByKpi);
    
    const aiData = {
        isLoading: isAiLoading,
        anomalies,
        predictions,
        // FIX: Add missing forecasts property to the aiData object.
        forecasts,
    };
    
    if (isLoading) {
        return (
             <div className="flex justify-center items-center h