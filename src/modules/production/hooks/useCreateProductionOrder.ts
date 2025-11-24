import { useState } from 'react';
import { createMockProductionOrder, isMock, supabase } from '../../../lib/supabase/client';
import { ProductionOrder } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useCreateProductionOrder = () => {
  const { organization } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (payload: Omit<ProductionOrder, 'id'>) => {
    if (!organization) throw new Error('Organização não selecionada');
    setLoading(true);
    setError(null);
    try {
      if (isMock) {
        const order: ProductionOrder = { ...payload, id: crypto.randomUUID(), organization_id: organization.id };
        const { data, error } = await createMockProductionOrder(order);
        if (error) throw error;
        return data?.[0];
      }
      const { data, error } = await supabase
        .from('production_orders')
        .insert({ ...payload, organization_id: organization.id })
        .select()
        .single();
      if (error) throw error;
      return data as ProductionOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar ordem';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
