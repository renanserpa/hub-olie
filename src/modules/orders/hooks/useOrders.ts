import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { Order } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useOrders = () => {
  const { organization } = useApp();
  const [data, setData] = useState<Order[]>([]);
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
        const { data: mockData, error: mockError } = await fetchMockTable<Order>('orders', organization.id);
        if (mockError) throw mockError;
        setData(mockData || []);
        return;
      }

      const { data: orders, error: supabaseError } = await supabase
        .from('orders')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setData(orders || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pedidos';
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
