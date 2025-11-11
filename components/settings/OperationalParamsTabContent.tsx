import React, { useState, useEffect } from 'react';
import { SystemSetting } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loader2, SlidersHorizontal, Info, History } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import SettingsHistoryModal from './SettingsHistoryModal';

const OperationalParamsTabContent: React.FC = () => {
    const { settingsData, isLoading, isAdmin, refresh } = useSettings();
    const [localSettings, setLocalSettings] = useState<SystemSetting[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [historyModalKey, setHistoryModalKey] = useState<string | null>(null);

    useEffect(() => {
        if (settingsData?.sistema) {
            const operationalSettings = settingsData.sistema.filter(
                s => s.category === 'logistica' || s.category === 'producao' || s.category === 'sistema'
            );
            setLocalSettings(operationalSettings);
        }
    }, [settingsData]);

    const handleFieldChange = (id: string, fieldKey: string, value: any) => {
        setLocalSettings(prev =>
            prev.map(setting => {
                if (setting.id === id) {
                    try {
                        const parsedValue = JSON.parse(setting.value);
                        parsedValue[fieldKey] = value;
                        return { ...setting, value: JSON.stringify(parsedValue, null, 2) };
                    } catch (e) {
                        return { ...setting, value: value };
                    }
                }
                return setting;
            })
        );
    };

    const handleSave = async () => {
        if (!isAdmin) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para salvar.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            const changedSettings = localSettings.filter(local => {
                const original = settingsData?.sistema.find(s => s.id === local.id);
                return original?.value !== local.value;
            });

            if (changedSettings.length === 0) {
                toast({ title: 'Nenhuma Alteração', description: 'Nenhum parâmetro foi modificado.' });
                return;
            }
            for (const setting of changedSettings) {
                await dataService.updateSystemSetting(setting.key, JSON.parse(setting.value), 'user', 1.0, 'Alteração manual de parâmetro.');
            }

            toast({ title: 'Sucesso!', description: 'Parâmetros operacionais salvos.' });
            refresh();

        } catch (e) {
            toast({ title: 'Erro!', description: 'Não foi possível salvar os parâmetros.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderField = (setting: SystemSetting, key: string, value: any) => {
        const inputId = `${setting.id}-${key}`;
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const type = typeof value === 'number' ? 'number' : 'text';

        return (
            <div key={key}>
                <label htmlFor={inputId} className="block text-xs font-medium text-textSecondary">{label}</label>
                <input
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={(e) => handleFieldChange(setting.id, key, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md text-sm bg-background dark:bg-dark-background"
                    disabled={!isAdmin || isSaving}
                />
            </div>
        )
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3 text-sm text-textSecondary dark:text-dark-textSecondary p-3 bg-secondary dark:bg-dark-secondary rounded-lg border border-border dark:border-dark-border">
                <Info size={28} className="flex-shrink-0 text-primary" />
                <p>Gerencie os parâmetros que controlam as regras de negócio dos módulos de Logística, Produção e outros. As alterações aqui podem impactar diretamente a operação. A IA pode sugerir otimizações na aba de Governança.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localSettings.map(setting => (
                    <Card key={setting.id}>
                        <CardHeader className="flex-row items-start justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <SlidersHorizontal size={16} />
                                {setting.description}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setHistoryModalKey(setting.key)}><History size={14} className="mr-1"/> Histórico</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {(() => {
                                try {
                                    const parsed = JSON.parse(setting.value);
                                    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                                        return Object.entries(parsed).map(([key, value]) => renderField(setting, key, value));
                                    }
                                } catch (e) { /* Fall through for non-JSON values */ }
                                return (
                                     <div>
                                        <label className="block text-xs font-medium text-textSecondary">Valor</label>
                                        <textarea 
                                            value={setting.value} 
                                            onChange={(e) => handleFieldChange(setting.id, 'value', e.target.value)}
                                            rows={5}
                                            className="mt-1 w-full p-2 border rounded-md text-sm bg-background dark:bg-dark-background font-mono"
                                            disabled={!isAdmin || isSaving}
                                        />
                                     </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isAdmin && (
                <div className="flex justify-end sticky bottom-6">
                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="shadow-lg">
                       {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Salvar Parâmetros
                    </Button>
                </div>
            )}
            {historyModalKey && (
                <SettingsHistoryModal
                    isOpen={!!historyModalKey}
                    onClose={() => setHistoryModalKey(null)}
                    settingKey={historyModalKey}
                    onRevertSuccess={() => { setHistoryModalKey(null); refresh(); }}
                />
            )}
        </div>
    );
};

export default OperationalParamsTabContent;
