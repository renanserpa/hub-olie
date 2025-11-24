import { useState } from 'react';
import { deleteMockCustomer, isMock, supabase } from '../../../lib/supabase/client';
import { useApp } from '../../../contexts/AppContext';

export const useDeleteCustomer = () => {
  const { organization } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!organization) throw new Error('Organização não selecionada');
    setLoading(true);
    setError(null);
    try {
      if (isMock) {
        const { error } = await deleteMockCustomer(id);
        if (error) throw error;
        return true;
      }
      const { error } = await supabase.from('customers').delete().eq('id', id).eq('organization_id', organization.id);
      if (error) throw error;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir cliente';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
};
