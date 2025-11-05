import React, { useState } from 'react';
import { Palette, Wrench, Paintbrush, Type as TypeIcon, Loader2 } from 'lucide-react';
import TabLayout from '../ui/TabLayout';
import TabContent from '../TabContent';
import { useSettings } from '../../hooks/useSettings';
import { AnySettingsItem, FieldConfig, SettingsCategory } from '../../types';
import PlaceholderContent from '../PlaceholderContent';
import { cn } from '../../lib/utils';
import { MaterialTabs } from '../settings/materials/MaterialTabs';

const CATALOG_TABS = [
  { id: 'personalization', label: 'Personalização', icon: Palette, scope: 'Settings' },
  { id: 'materials', label: 'Materiais de Produção', icon: Wrench, scope: 'Settings' },
];

const PERSONALIZATION_SUB_TABS = [
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
const fontFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome', type: 'text' }, { key: 'category', label: 'Categoria', type: 'select', options: [ {value: 'script', label: 'Script'}, {value: 'serif', label: 'Serif'}, {value: 'sans-serif', label: 'Sans-serif'}, {value: 'decorative', label: 'Decorativa'}, {value: 'handwritten', label: 'Manuscrita'}]}, { key: 'style', label: 'Estilo', type: 'select', options: [ {value: 'regular', label: 'Regular'}, {value: 'bold', label: 'Bold'}, {value: 'italic', label: 'Italic'}, {value: 'script', label: 'Script'}]}, { key: 'font_file_url', label: 'Arquivo da Fonte (.ttf, .otf)', type: 'file' }, { key: 'preview_url', label: 'URL da Imagem de Preview', type: 'text' }, { key: 'is_active', label: 'Status', type: 'checkbox' }, ];


const CatalogManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState(CATALOG_TABS[0].id);
    const [activePersonalizationSubTab, setActivePersonalizationSubTab] = useState(PERSONALIZATION_SUB_TABS[0].id);
    const [activeCoresSubTab, setActiveCoresSubTab] = useState(CORES_SUB_TABS[0].id);
    
    const { settingsData, isLoading, isAdmin, handleAdd, handleUpdate, handleDelete } = useSettings();

    const createCrudHandlers = (category: SettingsCategory, subTab: string | null = null, subSubTab: string | null = null) => ({
        onAdd: (item: Omit<AnySettingsItem, 'id'>, fileData?: Record<string, File | null>) => handleAdd(category, item, subTab, subSubTab, fileData),
        onUpdate: (item: AnySettingsItem, fileData?: Record<string, File | null>) => handleUpdate(category, item, subTab, subSubTab, fileData),
        onDelete: (itemId: string) => handleDelete(category, itemId, subTab, subSubTab),
    });

    const renderPersonalizationContent = () => {
        if (!settingsData) return null;
        
        const suppliersOptions = settingsData.suppliers?.map(s => ({ value: s.id, label: s.name })) || [];
        const fabricColorOptions = settingsData.catalogs.cores_texturas.tecido?.map(c => ({ value: c.id, label: c.name })) || [];

        const textureFieldConfig: FieldConfig[] = [
            { key: 'name', label: 'Nome da Textura', type: 'text' }, { key: 'description', label: 'Descrição', type: 'textarea' },
            { key: 'image_url', label: 'URL da Imagem (Foto)', type: 'text' }, { key: 'hex_code', label: 'Cor Principal (Hex)', type: 'color' },
            { key: 'fabric_color_id', label: 'Cor Equivalente no Sistema', type: 'select', options: fabricColorOptions },
            { key: 'supplier_sku', label: 'Código do Fornecedor', type: 'text' }, { key: 'manufacturer_sku', label: 'Código do Fabricante', type: 'text' },
            { key: 'manufacturer_id', label: 'Fabricante', type: 'select', options: suppliersOptions }, { key: 'distributor_id', label: 'Distribuidor', type: 'select', options: suppliersOptions },
            { key: 'is_active', label: 'Status', type: 'checkbox' }
        ];

        switch (activePersonalizationSubTab) {
            case 'paletas_cores':
                if (!settingsData.catalogs.paletas_cores) return <PlaceholderContent title="Paletas de Cores" requiredTable="config_color_palettes" />;
                return <TabContent category="catalogs" data={settingsData.catalogs.paletas_cores} fields={paletteFieldConfig} {...createCrudHandlers('catalogs', 'paletas_cores')} isAdmin={isAdmin} title="Paletas de Cores" />;
            
            case 'fontes_monogramas':
                if (!settingsData.catalogs.fontes_monogramas) return <PlaceholderContent title="Fontes para Monograma" requiredTable="config_fonts" />;
                return <TabContent category="catalogs" data={settingsData.catalogs.fontes_monogramas} fields={fontFieldConfig} {...createCrudHandlers('catalogs', 'fontes_monogramas')} isAdmin={isAdmin} title="Fontes para Monograma" />;

            case 'cores_texturas': {
                const colorData = settingsData.catalogs.cores_texturas;
                let data: AnySettingsItem[] | undefined, fields: FieldConfig[] = [], title = '', tableName = '';

                switch (activeCoresSubTab) {
                    case 'tecido': data = colorData.tecido; fields = colorFieldConfig; title = 'Cores de Tecido'; tableName = 'fabric_colors'; break;
                    case 'ziper': data = colorData.ziper; fields = colorFieldConfig; title = 'Cores de Zíper'; tableName = 'zipper_colors'; break;
                    case 'forro': data = colorData.forro; fields = colorFieldConfig; title = 'Cores de Forro'; tableName = 'lining_colors'; break;
                    case 'puxador': data = colorData.puxador; fields = colorFieldConfig; title = 'Cores de Puxador'; tableName = 'puller_colors'; break;
                    case 'vies': data = colorData.vies; fields = colorFieldConfig; title = 'Cores de Viés'; tableName = 'bias_colors'; break;
                    case 'bordado': data = colorData.bordado; fields = embroideryColorFieldConfig; title = 'Cores de Bordado'; tableName = 'embroidery_colors'; break;
                    case 'texturas': data = colorData.texturas; fields = textureFieldConfig; title = "Texturas de Tecido"; tableName = "fabric_textures"; break;
                }
                
                if (!data) return <PlaceholderContent title={title} requiredTable={tableName} />;
                return (
                    <>
                        <div className="mb-4">
                            <TabLayoutHorizontal tabs={CORES_SUB_TABS} activeTab={activeCoresSubTab} onTabChange={setActiveCoresSubTab} />
                        </div>
                        <TabContent category="catalogs" data={data} fields={fields} {...createCrudHandlers('catalogs', 'cores_texturas', activeCoresSubTab)} isAdmin={isAdmin} title={title} />
                    </>
                );
            }
            default: return null;
        }
    };

    const renderMainContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
        if (!settingsData) return <div className="text-center text-red-500">Falha ao carregar dados do catálogo.</div>;

        switch (activeTab) {
            case 'personalization':
                return (
                    <div className="grid grid-cols-12 gap-6 items-start">
                        <div className="col-span-3">
                             <TabLayoutVertical tabs={PERSONALIZATION_SUB_TABS} activeTab={activePersonalizationSubTab} onTabChange={setActivePersonalizationSubTab} />
                        </div>
                        <div className="col-span-9">
                            {renderPersonalizationContent()}
                        </div>
                    </div>
                );
            case 'materials':
                return <MaterialTabs />;
            default:
                return null;
        }
    };
    
    return (
        <div>
            <div className="mb-6"><TabLayout tabs={CATALOG_TABS} activeTab={activeTab} onTabChange={setActiveTab} /></div>
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
     <div className="border-b border-border dark:border-dark-border">
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


export default CatalogManagement;
