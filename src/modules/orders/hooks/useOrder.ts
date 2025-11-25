import { useEffect, useState } from 'react';
import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { Order } from '../../../types';
import { useApp } from '../../../contexts/AppContext';
import { mockCustomers } from '../../../lib/supabase/mockData';

export const useOrder = (id?: string) => {
  const { organization } = useApp();
  const [data, setData] = useState<Order | null>(null);
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
        if (isMockMode) {
          const { data, error } = await fetchMockTable<Order>('orders', organization.id);
          if (error) throw error;
          const order = (data || []).find((o) => o.id === id) || null;
          if (!order) {
            setData(null);
          } else {
            const customer =
              order.customer || mockCustomers.find((c) => c.id === order.customer_id && c.organization_id === organization.id) || null;
            setData({ ...order, customer });
          }
        } else {
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*), customer:customer_id(id, name, email, phone)')
            .eq('organization_id', organization.id)
            .eq('id', id)
            .maybeSingle();
          if (error) throw error;
          setData(data as unknown as Order);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, organization]);

  return { data, loading, error };
};
