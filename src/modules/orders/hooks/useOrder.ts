import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { Order } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useOrder = (id?: string) => {
  const { organization } = useApp();
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      if (!organization) {
        setData(null);
        return;
      }
      if (isMockMode) {
        const { data: orders, error: mockError } = await fetchMockTable<Order>('orders', organization.id);
        if (mockError) throw mockError;
        const order = (orders || []).find((row) => row.id === id) || null;
        setData(order);
      } else {
        const { data: order, error: queryError } = await supabase
          .from('orders')
          .select('*')
          .eq('organization_id', organization.id)
          .eq('id', id)
          .maybeSingle();
        if (queryError) throw queryError;
        setData(order);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  }, [id, organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
