import React, { useState } from 'react';
import { Settings, Puzzle, Palette, Wrench, Monitor, Image as ImageIcon, Shield, Loader2, Paintbrush, Type as TypeIcon, Users } from 'lucide-react';
import TabLayout from './ui/TabLayout';
import IntegrationsTabContent from './IntegrationsTabContent';
import TabContent from './TabContent';
import SystemTabContent from './SystemTabContent';
import AppearanceTabContent from './AppearanceTabContent';
import SecurityTabContent from './SecurityTabContent';
import { useSettings } from '../hooks/useSettings';
import { AnySettingsItem, FieldConfig, SettingsCategory } from '../types';
import PlaceholderContent from './PlaceholderContent';
import { cn } from '../lib/utils';
import { MaterialTabs } from './settings/materials/MaterialTabs';

const SETTINGS_TABS = [
  { id: 'integrations', label: 'Integrações', icon: Puzzle },
  { id: 'catalogs', label: 'Catálogos', icon: Palette },
  { id: 'materials', label: 'Materiais', icon: Wrench },
  { id: 'system', label: 'Sistema', icon: Monitor },
  { id: 'appearance', label: 'Aparência', icon: ImageIcon },
  { id: 'security', label: 'Segurança', icon: Shield },
];

const CATALOGS_SUB_TABS = [
    { id: 'paletas_cores', label: 'Paletas de Cores', icon: Palette },
    { id: 'cores_texturas', label: 'Cores & Texturas', icon: Paintbrush },
    { id: 'fontes_monogramas', label: 'Fontes p/ Monograma', icon: TypeIcon },
];

const CORES_SUB_TABS = [
    { id: 'tecido', label: 'Tecido' }, { id: 'ziper', label: 'Zíper' }, { id: 'forro', label: 'Forro' },
    { id: 'puxador', label: 'Puxador' }, { id: 'vies', label: 'Viés' }, { id: 'bordado', label: 'Bordado' },
    { id: 'texturas', label: 'Texturas' },
];

// --- Field Configurations ---
const paletteFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome', type: 'text' }, { key: 'descricao', label: 'Descrição', type: 'textarea' }, { key: 'is_active', label: 'Status', type: 'checkbox' }, ];
const colorFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome', type: 'text' }, { key: 'hex', label: 'Cor (Hex)', type: 'color' }, { key: 'is_active', label: 'Status', type: 'checkbox' }, ];
const embroideryColorFieldConfig: FieldConfig[] = [ ...colorFieldConfig, { key: 'thread_type', label: 'Tipo de Linha', type: 'select', options: [ {value: 'rayon', label: 'Rayon'}, {value: 'polyester', label: 'Polyester'}, {value: 'cotton', label: 'Algodão'}, {value: 'metallic', label: 'Metálica'}]} ];
const textureFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome', type: 'text' }, { key: 'description', label: 'Descrição', type: 'textarea' }, { key: 'image_url', label: 'URL da Imagem', type: 'text' }, { key: 'is_active', label: 'Status', type: 'checkbox' }];
const fontFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome', type: 'text' }, { key: 'category', label: 'Categoria', type: 'select', options: [ {value: 'script', label: 'Script'}, {value: 'serif', label: 'Serif'}, {value: 'sans-serif', label: 'Sans-serif'}, {value: 'decorative', label: 'Decorativa'}, {value: 'handwritten', label: 'Manuscrita'}]}, { key: 'style', label: 'Estilo', type: 'select', options: [ {value: 'regular', label: 'Regular'}, {value: 'bold', label: 'Bold'}, {value: 'italic', label: 'Italic'}, {value: 'script', label: 'Script'}]}, { key: 'font_file_url', label: 'Arquivo da Fonte (.ttf, .otf)', type: 'file' }, { key: 'preview_url', label: 'URL da Imagem de Preview', type: 'text' }, { key: 'is_active', label: 'Status', type: 'checkbox' }, ];

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('integrations');
    const [activeCatalogsSubTab, setActiveCatalogsSubTab] = useState(CATALOGS_SUB_TABS[0].id);
    const [activeCoresSubTab, setActiveCoresSubTab] = useState(CORES_SUB_TABS[0].id);

    const { settingsData, isLoading, isAdmin, handleAdd, handleUpdate, handleDelete } = useSettings();

    const handleTabChange = (tabId: string) => setActiveTab(tabId);
    
    const createCrudHandlers = (category: SettingsCategory, subTab: string | null = null, subSubTab: string | null = null) => ({
        onAdd: (item: Omit<AnySettingsItem, 'id'>, fileData?: Record<string, File | null>) => handleAdd(category, item, subTab, subSubTab, fileData),
        onUpdate: (item: AnySettingsItem, fileData?: Record<string, File | null>) => handleUpdate(category, item, subTab, subSubTab, fileData),
        onDelete: (itemId: string) => handleDelete(category, itemId, subTab, subSubTab),
    });

    const renderCatalogsContent = () => {
        if (!settingsData) return null;
        
        const dataExists = (key: keyof typeof settingsData.catalogs | keyof typeof settingsData.catalogs.cores_texturas, isSubSub: boolean = false) => {
          if (isSubSub) {
            return (settingsData.catalogs.cores_texturas as any)[key]?.length > 0
          }
          return (settingsData.catalogs as any)[key]?.length > 0
        };

        switch (activeCatalogsSubTab) {
            case 'paletas_cores': {
                return dataExists('paletas_cores')
                    ? <TabContent category="catalogs" data={settingsData.catalogs.paletas_cores} fields={paletteFieldConfig} {...createCrudHandlers('catalogs', 'paletas_cores')} isAdmin={isAdmin} title="Paletas de Cores" />
                    : <PlaceholderContent title="Paletas de Cores" requiredTable="config_color_palettes" />;
            }
            case 'fontes_monogramas': {
                 return dataExists('fontes_monogramas')
                    ? <TabContent category="catalogs" data={settingsData.catalogs.fontes_monogramas} fields={fontFieldConfig} {...createCrudHandlers('catalogs', 'fontes_monogramas')} isAdmin={isAdmin} title="Fontes para Monograma" />
                    : <PlaceholderContent title="Fontes para Monograma" requiredTable="config_fonts" />;
            }
            case 'cores_texturas': {
                const colorData = settingsData.catalogs.cores_texturas;
                let data: AnySettingsItem[] = [], fields: FieldConfig[] = [], title = '', tableName = '';

                switch (activeCoresSubTab) {
                    case 'tecido': data = colorData.tecido; fields = colorFieldConfig; title = 'Cores de Tecido'; tableName = 'fabric_colors'; break;
                    case 'ziper': data = colorData.ziper; fields = colorFieldConfig; title = 'Cores de Zíper'; tableName = 'zipper_colors'; break;
                    case 'forro': data = colorData.forro; fields = colorFieldConfig; title = 'Cores de Forro'; tableName = 'lining_colors'; break;
                    case 'puxador': data = colorData.puxador; fields = colorFieldConfig; title = 'Cores de Puxador'; tableName = 'puller_colors'; break;
                    case 'vies': data = colorData.vies; fields = colorFieldConfig; title = 'Cores de Viés'; tableName = 'bias_colors'; break;
                    case 'bordado': data = colorData.bordado; fields = embroideryColorFieldConfig; title = 'Cores de Bordado'; tableName = 'embroidery_colors'; break;
                    case 'texturas': data = colorData.texturas; fields = textureFieldConfig; title = "Texturas de Tecido"; tableName = "fabric_textures"; break;
                }
                
                if (!dataExists(activeCoresSubTab as any, true)) {
                    return <PlaceholderContent title={title} requiredTable={tableName} />;
                }
                return <TabContent category="catalogs" data={data} fields={fields} {...createCrudHandlers('catalogs', 'cores_texturas', activeCoresSubTab)} isAdmin={isAdmin} title={title} />;
            }
            default: return null;
        }
    };

    const renderMainContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
        if (!settingsData) return <div className="text-center text-red-500">Falha ao carregar configurações.</div>;

        switch (activeTab) {
            case 'integrations': return <IntegrationsTabContent />;
            case 'catalogs': return (
                <div className="grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-3">
                         <TabLayoutVertical tabs={CATALOGS_SUB_TABS} activeTab={activeCatalogsSubTab} onTabChange={setActiveCatalogsSubTab} />
                    </div>
                    <div className="col-span-9">
                        {activeCatalogsSubTab === 'cores_texturas' && (
                            <div className="mb-4">
                                <TabLayoutHorizontal tabs={CORES_SUB_TABS} activeTab={activeCoresSubTab} onTabChange={setActiveCoresSubTab} />
                            </div>
                        )}
                        {renderCatalogsContent()}
                    </div>
                </div>
            );
            case 'materials': return <MaterialTabs />;
            case 'system': return <SystemTabContent initialSettings={settingsData.sistema} isAdmin={isAdmin} />;
            case 'appearance': return <AppearanceTabContent />;
            case 'security': return <SecurityTabContent />;
            default: return null;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3"><Settings className="text-primary" size={28} /><h1 className="text-3xl font-bold text-textPrimary">Configurações</h1></div>
                    <p className="text-textSecondary mt-1">Gerencie os dados mestres e configurações globais da plataforma.</p>
                </div>
            </div>
            <div className="mb-6"><TabLayout tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={handleTabChange} /></div>
            <div>{renderMainContent()}</div>
        </div>
    );
};

// --- Sub-Navigation Components ---
const TabLayoutVertical: React.FC<{tabs: any[], activeTab: string, onTabChange: (id: string) => void}> = ({tabs, activeTab, onTabChange}) => (
    <nav className="flex flex-col space-y-1 sticky top-24">
        {tabs.map(tab => (
            <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={cn('flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-colors',
                activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-accent hover:text-textPrimary')}
            >
                {tab.icon && <tab.icon size={16} />}
                {tab.label}
            </button>
        ))}
    </nav>
);
const TabLayoutHorizontal: React.FC<{tabs: any[], activeTab: string, onTabChange: (id: string) => void}> = ({tabs, activeTab, onTabChange}) => (
     <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => onTabChange(tab.id)}
                    className={cn(
                        'whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none',
                        activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    </div>
);


export default SettingsPage;