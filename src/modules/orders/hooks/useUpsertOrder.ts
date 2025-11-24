import { useState } from 'react';
import { isMock, supabase, upsertMockOrder } from '../../../lib/supabase/client';
import { Order } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useUpsertOrder = () => {
  const { organization } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsert = async (order: Order) => {
    if (!organization) throw new Error('Organização não selecionada');
    setLoading(true);
    setError(null);
    try {
      if (isMock) {
        const result = await upsertMockOrder({ ...order, organization_id: organization.id });
        if (result.error) throw result.error;
        return result.data?.[0];
      }
      const { data, error } = await supabase.from('orders').upsert({ ...order, organization_id: organization.id }).select();
      if (error) throw error;
      return data?.[0];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar pedido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { upsert, loading, error };
};
