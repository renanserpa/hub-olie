import { useCallback, useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';
import { Customer } from '../../../types';

export const useCustomers = () => {
  const { organization } = useApp();
  const [data, setData] = useState<Customer[]>([]);
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
        const { data: mockData, error: mockError } = await fetchMockTable<Customer>('customers', organization.id);
        if (mockError) throw mockError;
        setData(mockData || []);
        return;
      }

      const { data: customers, error: supabaseError } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setData(customers || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar clientes';
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
