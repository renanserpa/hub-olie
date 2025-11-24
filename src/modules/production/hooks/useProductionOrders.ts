import { useEffect, useState } from 'react';
import { fetchMockTable, isMock, supabase } from '../../../lib/supabase/client';
import { ProductionOrder } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useProductionOrders = () => {
  const { organization } = useApp();
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!organization) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        if (isMock) {
          const { data, error } = await fetchMockTable<ProductionOrder>('production_orders', organization.id);
          if (error) throw error;
          setData(data || []);
        } else {
          const { data, error } = await supabase
            .from('production_orders')
            .select('*')
            .eq('organization_id', organization.id)
            .order('planned_start', { ascending: false });
          if (error) throw error;
          setData(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ordens de produção');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [organization]);

  return { data, loading, error };
};
