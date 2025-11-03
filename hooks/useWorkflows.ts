import { useState, useEffect, useCallback } from 'react';
import { WorkflowRule } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useWorkflows() {
    const [rules, setRules] = useState<WorkflowRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getCollection<WorkflowRule>('workflow_rules');
            setRules(data);
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar as regras de automação.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        isLoading,
        rules,
        refresh: loadData,
    };
}
