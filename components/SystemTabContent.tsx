
import React, { useState, useMemo } from 'react';
import { SystemSetting } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { supabaseService } from '../services/firestoreService';
import { toast } from '../hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SystemTabContentProps {
  initialSettings: SystemSetting[];
  isAdmin: boolean;
}

const SystemTabContent: React.FC<SystemTabContentProps> = ({ initialSettings, isAdmin }) => {
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    const groupedSettings = useMemo(() => {
        return settings.reduce((acc, setting) => {
            const group = setting.category || 'geral';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(setting);
            return acc;
        }, {} as Record<string, SystemSetting[]>);
    }, [settings]);

    const handleInputChange = (id: string, field: string, value: any) => {
        setSettings(prevSettings => {
            return prevSettings.map(setting => {
                if (setting.id === id) {
                    try {
                        const parsedValue = JSON.parse(setting.value);
                        parsedValue[field] = value;
                        return { ...setting, value: JSON.stringify(parsedValue) };
                    } catch (e) {
                        // This case handles non-JSON values, which shouldn't happen based on the data structure
                        // but it's a safe fallback.
                        return { ...setting, value: value };
                    }
                }
                return setting;
            });
        });
    };
    
    const handleSave = async () => {
        if (!isAdmin) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para salvar as configurações.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            await supabaseService.updateSystemSettings(settings);
            toast({ title: 'Sucesso!', description: 'Configurações do sistema salvas.' });
        } catch (e) {
            toast({ title: 'Erro!', description: 'Não foi possível salvar as configurações.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderField = (setting: SystemSetting, key: string, value: any) => {
        const inputId = `${setting.id}-${key}`;
        return (
            <div key={key}>
                <label htmlFor={inputId} className="block text-sm font-medium text-textSecondary capitalize">{key.replace(/_/g, ' ')}</label>
                <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    id={inputId}
                    value={value}
                    onChange={(e) => handleInputChange(setting.id, key, typeof value === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100"
                    disabled={!isAdmin}
                />
            </div>
        );
    };

    const formatCategoryName = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="space-y-6">
            {Object.entries(groupedSettings).map(([category, settingsInCategory]) => (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle>{formatCategoryName(category)}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FIX: Add an Array.isArray check to ensure settingsInCategory is an array before mapping. */}
                        {Array.isArray(settingsInCategory) && settingsInCategory.map(setting => (
                            <div key={setting.id} className="p-4 border rounded-xl bg-secondary/50">
                                <h4 className="font-semibold text-textPrimary">{setting.name}</h4>
                                <p className="text-sm text-textSecondary mb-4">{setting.description}</p>
                                <div className="space-y-3">
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(setting.value) as Record<string, any>;
                                            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                                                return Object.keys(parsed).map((key) => {
                                                    const value = parsed[key];
                                                    return renderField(setting, key, value);
                                                });
                                            }
                                        } catch (e) {
                                            // Silently ignore if value is not valid JSON, or render a simple text input for it
                                            return renderField(setting, 'value', setting.value);
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
            {isAdmin && (
                <div className="flex justify-end sticky bottom-6">
                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="shadow-lg">
                       {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Salvar Todas as Alterações
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SystemTabContent;