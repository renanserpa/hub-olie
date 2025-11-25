import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { Customer } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useCustomers = () => {
  const { organization } = useApp();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
