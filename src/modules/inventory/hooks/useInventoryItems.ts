import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { InventoryItem } from '../../../types';

export const useInventoryItems = () => {
  const { organization } = useApp();
  const [data, setData] = useState<InventoryItem[]>([]);
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
        const { data: mockData, error: mockError } = await fetchMockTable<InventoryItem>('inventory_items', organization.id);
        if (mockError) throw mockError;
        setData(mockData || []);
        return;
      }

      const { data: items, error: supabaseError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name');

      if (supabaseError) throw supabaseError;
      setData(items || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar estoque';
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
