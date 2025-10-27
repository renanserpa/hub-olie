import React, { useState, useEffect, useCallback } from 'react';
import { firestoreService } from './services/firestoreService';
// FIX: Import FieldConfig from the shared types file.
import { SettingsData, User, SettingsCategory, AnyItem, FieldConfig } from './types';
import TabContent from './components/TabContent';
import { Card, CardContent } from './components/ui/Card';
import TabLayout from './components/ui/TabLayout';

const TABS: Record<SettingsCategory, string> = {
    integrations: 'Integrações',
    catalogs: 'Catálogos',
    materials: 'Materiais',
    statuses: 'Status',
    globalConfigs: 'Configurações Globais'
};

const App: React.FC = () => {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<SettingsCategory>('integrations');
    const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

    const isAdmin = user?.role === 'AdminGeral';

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [settingsData, userData] = await Promise.all([
                firestoreService.getSettings(),
                firestoreService.getCurrentUser()
            ]);
            setSettings(settingsData);
            setUser(userData);
        } catch (e) {
            setError('Falha ao carregar as configurações.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!settings) return;

        const currentTabData = settings[activeTab];
        if (typeof currentTabData === 'object' && !Array.isArray(currentTabData) && currentTabData !== null) {
            const subCategories = Object.keys(currentTabData);
            if (subCategories.length > 0 && !subCategories.includes(activeSubTab ?? '')) {
                setActiveSubTab(subCategories[0]);
            }
        } else {
            setActiveSubTab(null);
        }
    }, [activeTab, settings, activeSubTab]);


    const handleAddItem = async (category: SettingsCategory, itemData: Omit<AnyItem, 'id'>) => {
        if (!isAdmin) return;
        try {
            const newItem = await firestoreService.addSetting(category, itemData, activeSubTab);
            setSettings(prev => {
                if (!prev) return null;
                const newSettings = JSON.parse(JSON.stringify(prev));
                if (activeSubTab && (category === 'catalogs' || category === 'materials' || category === 'statuses')) {
                    (newSettings[category] as Record<string, AnyItem[]>)[activeSubTab].push(newItem);
                } else {
                    (newSettings[category] as AnyItem[]).push(newItem);
                }
                return newSettings;
            });
        } catch (e) {
            console.error("Failed to add item", e);
            setError(`Falha ao adicionar item.`);
        }
    };

    const handleUpdateItem = async (category: SettingsCategory, itemData: AnyItem) => {
        if (!isAdmin) return;
        try {
            const updatedItem = await firestoreService.updateSetting(category, itemData.id, itemData, activeSubTab);
            setSettings(prev => {
                 if (!prev) return null;
                const newSettings = JSON.parse(JSON.stringify(prev));
                let dataList: AnyItem[];
                 if (activeSubTab && (category === 'catalogs' || category === 'materials' || category === 'statuses')) {
                    dataList = (newSettings[category] as Record<string, AnyItem[]>)[activeSubTab];
                } else {
                    dataList = newSettings[category] as AnyItem[];
                }
                const index = dataList.findIndex(item => item.id === updatedItem.id);
                if (index !== -1) dataList[index] = updatedItem;
                return newSettings;
            });
        } catch (e) {
            console.error("Failed to update item", e);
            setError(`Falha ao atualizar item.`);
        }
    };

    const handleDeleteItem = async (category: SettingsCategory, itemId: string) => {
        if (!isAdmin) return;
        try {
            await firestoreService.deleteSetting(category, itemId, activeSubTab);
            setSettings(prev => {
                if (!prev) return null;
                const newSettings = JSON.parse(JSON.stringify(prev));
                 if (activeSubTab && (category === 'catalogs' || category === 'materials' || category === 'statuses')) {
                    (newSettings[category] as Record<string, AnyItem[]>)[activeSubTab] = (newSettings[category] as Record<string, AnyItem[]>)[activeSubTab].filter((item: AnyItem) => item.id !== itemId);
                } else {
                    newSettings[category] = (newSettings[category] as AnyItem[]).filter((item: AnyItem) => item.id !== itemId);
                }
                return newSettings;
            });
        } catch (e) {
            console.error("Failed to delete item", e);
            setError(`Falha ao deletar item.`);
        }
    };
    
    // FIX: Add explicit return type FieldConfig[] to fix type inference issue.
    const getFieldsForCategory = (category: SettingsCategory): FieldConfig[] => {
        switch (category) {
            case 'integrations': return [
                { key: 'name', label: 'Nome', type: 'text' }, { key: 'apiKey', label: 'API Key', type: 'text' }, { key: 'secret', label: 'Secret', type: 'text' }, { key: 'enabled', label: 'Status', type: 'checkbox' }];
            case 'catalogs': return [
                { key: 'name', label: 'Nome', type: 'text' }, { key: 'code', label: 'Código', type: 'text' }, { key: 'hexColor', label: 'Cor', type: 'color' }];
            case 'materials': return [
                { key: 'name', label: 'Nome', type: 'text' }, { key: 'group', label: 'Grupo', type: 'text' }, { key: 'supplier', label: 'Fornecedor', type: 'text' }, { key: 'texture', label: 'Textura', type: 'text' }];
            case 'statuses': return [
                { key: 'name', label: 'Nome', type: 'text' }, { key: 'color', label: 'Cor', type: 'color' }, { key: 'description', label: 'Descrição', type: 'text' }];
            case 'globalConfigs': return [
                { key: 'name', label: 'Configuração', type: 'text' }, { key: 'value', label: 'Valor', type: 'text' }, { key: 'unit', label: 'Unidade', type: 'text' }];
            default: return [{ key: 'name', label: 'Name', type: 'text' }];
        }
    };

    const formatSubCategoryName = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const currentTabData = settings ? settings[activeTab] : null;
    const isNested = typeof currentTabData === 'object' && !Array.isArray(currentTabData) && currentTabData !== null;
    // FIX: Ensure dataForContent is always an array to satisfy TabContent's `data` prop type.
    const dataForContent = isNested 
        ? (currentTabData as Record<string, AnyItem[]>)[activeSubTab ?? ''] ?? []
        : (currentTabData as AnyItem[] ?? []);
    const contentTitle = isNested && activeSubTab ? `${formatSubCategoryName(activeSubTab)}` : TABS[activeTab];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="mt-4 text-lg font-semibold text-textSecondary">Carregando...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen font-sans">
            <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-textPrimary">Olie Hub <span className="font-normal text-primary">| Configurações</span></h1>
                    {user && (
                        <div className="text-right">
                            <p className="font-medium text-textPrimary text-sm">{user.email}</p>
                            <p className="text-xs text-textSecondary">{user.role}</p>
                        </div>
                    )}
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6">
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert">{error}</div>}

                <Card>
                   <TabLayout
                        tabs={Object.entries(TABS).map(([id, label]) => ({ id, label }))}
                        activeTab={activeTab}
                        onTabChange={(tabId) => setActiveTab(tabId as SettingsCategory)}
                        subTabs={isNested ? Object.keys(currentTabData).map(key => ({ id: key, label: formatSubCategoryName(key) })) : undefined}
                        activeSubTab={activeSubTab}
                        onSubTabChange={setActiveSubTab}
                    />

                    {settings && dataForContent ? (
                         <CardContent>
                            <TabContent
                                key={`${activeTab}-${activeSubTab}`}
                                category={activeTab}
                                title={contentTitle}
                                data={dataForContent}
                                fields={getFieldsForCategory(activeTab)}
                                onAdd={handleAddItem}
                                onUpdate={handleUpdateItem}
                                onDelete={handleDeleteItem}
                                isAdmin={isAdmin}
                            />
                        </CardContent>
                    ) : (
                        <CardContent className="py-10 text-center text-textSecondary">
                            <p>Nenhum dado para exibir.</p>
                        </CardContent>
                    )}
                </Card>
            </main>
        </div>
    );
};

export default App;