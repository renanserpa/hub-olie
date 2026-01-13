import { useState, useEffect } from 'react';
import { SystemAudit } from '../types';
import { dataService } from '../services/dataService';
import { toast as _toast } from './use-toast';

export function useAnomalies() {
    const [anomalies, setAnomalies] = useState<SystemAudit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        const listener = dataService.listenToCollection<SystemAudit>('system_audit', undefined, setAnomalies, (allAudits) => {
            const anomalyLogs = allAudits
                .filter(log => log.key.endsWith('_ANOMALY'))
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setAnomalies(anomalyLogs);
            setIsLoading(false);
        });

        return () => listener.unsubscribe();

    }, []);

    return { anomalies, isLoading };
}