import { useEffect, useState } from 'react';
import { fetchMockTable, isMock, supabase } from '../../../lib/supabase/client';
import { ProductionOrder } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useProductionOrder = (id?: string) => {
  const { organization } = useApp();
  const [data, setData] = useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || !organization) {
        setData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        if (isMock) {
          const { data, error } = await fetchMockTable<ProductionOrder>('production_orders', organization.id);
          if (error) throw error;
          const order = (data || []).find((row) => row.id === id) || null;
          setData(order);
        } else {
          const { data, error } = await supabase
            .from('production_orders')
            .select('*')
            .eq('organization_id', organization.id)
            .eq('id', id)
            .maybeSingle();
          if (error) throw error;
          setData(data as ProductionOrder | null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ordem');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, organization]);

  return { data, loading, error };
};
