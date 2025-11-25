import { fetchMockTable, isMockMode, supabase } from '../../../lib/supabase/client';
import { InventoryItem } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

export const useInventoryItems = () => {
  const { organization } = useApp();
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
