import { useEffect, useState, useMemo } from 'react';
import { log } from '../../../lib/logger';
import { useApp } from '../../../contexts/AppContext';
import { supabase } from '../../../lib/supabaseClient';
import { useOlie } from '../../../contexts/OlieContext';
import { dataService } from '../../../services/dataService';
import { SystemSetting } from '../../../types';

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
    // FIX: Remove ENV dependency and hardcode to SUPABASE mode.
    env: 'SUPABASE',
    supabaseConnected: false,
    modulesDetected: [],
    lastSync: null,
    settings: {},
    warnings: [],
  });

  const isAdminGeral = useMemo(
    () => (user?.role === 'AdminGeral'),
    [user?.role]
  );

  async function runInitialization() {
    if (!can('Initializer', 'read')) {
      log.warn('[RBAC] Access denied to Initializer for role:', user?.role);
      return;
    }

    log.info('[Initializer] Starting system initialization...');
    let supabaseConnected = false;
    let warnings: string[] = [];

    // FIX: Simplified logic as SANDBOX mode is deprecated.
    if (supabase) {
      const { data, error } = await supabase.from('system_settings').select('*').limit(1);
      supabaseConnected = !error && !!data;
      if (error) warnings.push('Supabase access error on system_settings.');
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
      // FIX: Remove ENV dependency and hardcode to SUPABASE mode.
      env: 'SUPABASE',
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

  return { status, reload: runInitialization, hardReload, isAdminGeral };
}
