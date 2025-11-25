import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { Order } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useOrder = (id?: string) => {
  const { organization } = useApp();
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  }, [id, organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
