
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SystemConfig } from '../types';
import { toast } from './use-toast';

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let { data, error } = await supabase
        .from('system_config')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        // Se não encontrar, cria um registro padrão
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('system_config')
            .insert({
              olie_hub_name: 'Olie Hub',
              timezone: 'America/Sao_Paulo',
              default_currency: 'BRL'
            })
            .select()
            .single();

          if (insertError) throw insertError;
          data = newData;
        } else {
          throw error;
        }
      }

      setConfig(data);
    } catch (err: any) {
      console.error("Error fetching system config:", err);
      setError(err.message);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = async (updates: Partial<SystemConfig>) => {
    if (!config) return;

    try {
      const { data, error } = await supabase
        .from('system_config')
        .update(updates)
        .eq('id', config.id)
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso.",
      });
    } catch (err: any) {
      console.error("Error updating system config:", err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, updateConfig };
}
