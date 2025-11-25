import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { Order } from '../../../types';

export const useOrder = (id?: string) => {
  const { organization } = useApp();
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      if (!organization) {
        setData(null);
        return;
      }

      if (isMockMode) {
        const { data: mockData, error: mockError } = await fetchMockTable<Order>('orders', organization.id);
        if (mockError) throw mockError;
        const found = (mockData || []).find((row) => row.id === id) || null;
        setData(found);
        return;
      }

      const { data: order, error: supabaseError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (supabaseError) throw supabaseError;
      setData(order || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pedido';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id, organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
