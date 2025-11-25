import { useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { InventoryItem } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useInventoryItems = () => {
  const { organization } = useApp();
  const [data, setData] = useState<InventoryItem[]>([]);
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
        if (isMockMode) {
          const { data, error } = await fetchMockTable<InventoryItem>('inventory_items', organization.id);
          if (error) throw error;
          setData(data || []);
        } else {
          const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('organization_id', organization.id)
            .order('name');
          if (error) throw error;
          setData(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estoque');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [organization]);

  return { data, loading, error };
};
