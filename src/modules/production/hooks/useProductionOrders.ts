import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { ProductionOrder } from '../../../types';

export const useProductionOrders = () => {
  const { organization } = useApp();
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!organization) {
        setData([]);
        return;
      }

      if (isMockMode) {
        const { data: mockData, error: mockError } = await fetchMockTable<ProductionOrder>(
          'production_orders',
          organization.id,
        );
        if (mockError) throw mockError;
        setData(mockData || []);
        return;
      }

      const { data: productionOrders, error: supabaseError } = await supabase
        .from('production_orders')
        .select('*')
        .eq('organization_id', organization.id)
        .order('planned_start_date', { ascending: true });

      if (supabaseError) throw supabaseError;
      setData(productionOrders || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar ordens de produção';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
