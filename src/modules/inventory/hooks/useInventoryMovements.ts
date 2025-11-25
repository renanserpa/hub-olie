import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { InventoryMovement } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useInventoryMovements = () => {
  const { organization } = useApp();
  const [data, setData] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
