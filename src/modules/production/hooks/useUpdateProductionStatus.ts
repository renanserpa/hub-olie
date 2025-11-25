import { useState, useCallback } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { ProductionOrder } from '../../../types';
import { isMockMode, supabase, updateMockProductionOrderStatus } from '../../../lib/supabase/client';

export const useUpdateProductionStatus = () => {
  const { organization } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (id: string, status: ProductionOrder['status']) => {
      if (!organization) throw new Error('Organização não encontrada');
      setLoading(true);
      setError(null);
      try {
        if (isMockMode) {
          const { error } = await updateMockProductionOrderStatus(id, status);
          if (error) throw error;
          return;
        }

        const { error } = await supabase
          .from('production_orders')
          .update({ status })
          .eq('id', id)
          .eq('organization_id', organization.id);
        if (error) throw error;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [organization]
  );

  return { updateStatus, loading, error };
};
