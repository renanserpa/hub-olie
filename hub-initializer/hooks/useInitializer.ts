import { useEffect, useState, useMemo, useCallback } from 'react';
import { ENV } from '../../../lib/env';
import { log } from '../../../lib/logger';
import { useApp } from '../../../contexts/AppContext';
import { supabase } from '../../../lib/supabaseClient';
import { useOlie } from '../../../contexts/OlieContext';
import { dataService } from '../../../services/dataService';
import { InitializerLog, SystemSetting } from '../../../types';
import { seedDatabase } from '../../../services/seedingService';
import { toast } from '../../../hooks/use-toast';
import { ingestAgentMarkdown, ingestModuleMarkdown } from '../services/crewSyncService';

export interface InitStatus {
  env: string;
  supabaseConnected: boolean;
  modulesDetected: string[];
  lastSync: string | null;
  settings: Record<string, any>;
  warnings?: string[];
}

export function useInitializer() {
  const { setActiveModule, user } = useApp();
  const { can } = useOlie();
  const [status, setStatus] = useState<InitStatus>({
    env: ENV.APP_ENV,
    supabaseConnected: false,
    modulesDetected: [],
    lastSync: null,
    settings: {},
    warnings: [],
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);


  const isAdminGeral = useMemo(
    () => (user?.role === 'AdminGeral'),
    [user?.role]
  );

  const addLog = useCallback(async (logData: Omit<InitializerLog, 'id' | 'timestamp'>) => {
    await dataService.addDocument('initializer_logs', {
      ...logData,
      timestamp: new Date().toISOString()
    } as any);
  }, []);

  const handleUpload = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    try {
        for (const file of Array.from(files)) {
            // A simple heuristic to determine file type based on name.
            if (file.name.includes('agent')) {
                await ingestAgentMarkdown(file, addLog);
            } else {
                await ingestModuleMarkdown(file, addLog);
            }
        }
        toast({ title: "Upload Concluído", description: `Processados ${files.length} arquivo(s).`});
    } catch(error) {
        toast({ title: 'Erro no Upload', description: (error as Error).message, variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  }, [addLog]);

  async function runInitialization() {
    if (!can('Initializer', 'read')) {
      log.warn('[RBAC] Access denied to Initializer for role:', user?.role);
      return;
    }

    log.info('[Initializer] Starting system initialization...');
    let supabaseConnected = false;
    let warnings: string[] = [];

    if (ENV.APP_ENV !== 'SANDBOX' && supabase) {
      const { data, error } = await supabase.from('system_settings').select('*').limit(1);
      supabaseConnected = !error && !!data;
      if (error) warnings.push('Supabase access error on system_settings.');
    } else if (ENV.APP_ENV === 'SANDBOX') {
        supabaseConnected = true; // In sandbox, we assume connection is fine.
    }

    const settingsArr = await dataService.getCollection<SystemSetting>('system_settings');
    const modulesDetected = [
      'Dashboard','Orders','Production','Inventory','Finance','Analytics',
      'ExecutiveDashboard','Omnichannel','Marketing','Products','Purchases','Settings'
    ];

    const now = new Date().toISOString();
    const settings = Array.isArray(settingsArr)
      ? Object.fromEntries(settingsArr.map((s:any) => [s.key, s.value]))
      : {};

    const result: InitStatus = {
      env: ENV.APP_ENV,
      supabaseConnected,
      modulesDetected,
      lastSync: now,
      settings,
      warnings,
    };

    setStatus(result);
    await logAudit(result);
    log.info('[Initializer] System ready:', result);
  }
  
  const handleSeedDatabase = async () => {
    if (!isAdminGeral) {
        toast({ title: 'Acesso Negado', description: 'Apenas AdminGeral pode popular o banco.', variant: 'destructive' });
        return;
    }
    setIsSeeding(true);
    try {
        await seedDatabase();
        // Force a full app refresh to reload all data from the newly seeded database
        setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
        // Toast is already handled in the service
    } finally {
        setIsSeeding(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await dataService.testConnection();
    setTestResult(result);
    setIsTesting(false);
    toast({
        title: result.success ? "Teste Concluído" : "Falha no Teste",
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
    });
  };

  async function logAudit(data: InitStatus) {
    try {
      const payload = `[${new Date().toISOString()}] SYNC → ENV:${data.env} SUPABASE:${data.supabaseConnected} MODS:${data.modulesDetected.length} WARN:${data.warnings?.length ?? 0}\n`;
      console.log(payload);
      if(data.supabaseConnected) {
          await dataService.addDocument('system_audit', {
              key: 'INITIALIZER_BOOT',
              status: 'SUCCESS',
              details: {
                  env: data.env,
                  modules: data.modulesDetected.length,
                  warnings: data.warnings?.length
              }
          });
      }
    } catch (err) {
      console.error('[Initializer] Log write error', err);
    }
  }

  async function hardReload() {
    if (!isAdminGeral) {
      log.warn('[RBAC] hardReload denied. Required: AdminGeral.');
      return;
    }
    await runInitialization();
    // After boot, return to Dashboard
    setTimeout(() => setActiveModule('dashboard'), 1000);
  }

  useEffect(() => { runInitialization(); }, []);

  return { status, reload: runInitialization, hardReload, isAdminGeral, isSeeding, handleSeedDatabase, handleUpload, isProcessing, isTesting, testResult, handleTestConnection };
}