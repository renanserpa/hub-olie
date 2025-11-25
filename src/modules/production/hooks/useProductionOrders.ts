import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { ProductionOrder } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useProductionOrders = () => {
  const { organization } = useApp();
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ordens de produção');
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
