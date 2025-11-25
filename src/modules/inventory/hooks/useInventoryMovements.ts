import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { InventoryMovement } from '../../../types';

export const useInventoryMovements = (itemId?: string) => {
  const { organization } = useApp();
  const [data, setData] = useState<InventoryMovement[]>([]);
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
        const { data: mockData, error: mockError } = await fetchMockTable<InventoryMovement>(
          'inventory_movements',
          organization.id,
        );
        if (mockError) throw mockError;
        const filtered = itemId ? (mockData || []).filter((row) => row.item_id === itemId) : mockData || [];
        setData(filtered);
        return;
      }

      let query = supabase
        .from('inventory_movements')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data: movements, error: supabaseError } = await query;
      if (supabaseError) throw supabaseError;
      setData(movements || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar movimentações';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [itemId, organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
