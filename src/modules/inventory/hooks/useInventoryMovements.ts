import { useEffect, useState } from 'react';
import { fetchMockTable, isMock, supabase } from '../../../lib/supabase/client';
import { InventoryMovement } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useInventoryMovements = () => {
  const { organization } = useApp();
  const [data, setData] = useState<InventoryMovement[]>([]);
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
          const { data, error } = await fetchMockTable<InventoryMovement>('inventory_movements', organization.id);
          if (error) throw error;
          setData(data || []);
        } else {
          const { data, error } = await supabase
            .from('inventory_movements')
            .select('*')
            .eq('organization_id', organization.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setData(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [organization]);

  return { data, loading, error };
};
