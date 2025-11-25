import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { ProductionOrder } from '../../../types';

export const useProductionOrder = (id?: string) => {
  const { organization } = useApp();
  const [data, setData] = useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!organization) {
        setData(null);
        return;
      }

      if (isMockMode) {
        const { data: mockData, error: mockError } = await fetchMockTable<ProductionOrder>(
          'production_orders',
          organization.id,
        );
        if (mockError) throw mockError;
        const found = (mockData || []).find((row) => row.id === id) || null;
        setData(found);
        return;
      }

      const { data: productionOrder, error: supabaseError } = await supabase
        .from('production_orders')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (supabaseError) throw supabaseError;
      setData(productionOrder || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar ordem de produção';
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
