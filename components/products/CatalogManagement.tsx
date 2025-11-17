import React, { useState } from 'react';
import { Palette, Wrench, Paintbrush, Type as TypeIcon, Loader2, BookOpen, Layers, Link2, Hand, Scissors, Paintbrush2, ScanSearch } from 'lucide-react';
import TabLayout from '../ui/TabLayout';
import TabContent from '../TabContent';
import { useSettings } from '../../hooks/useSettings';
import { AnySettingsItem, FieldConfig, SettingsCategory, ProductCategory, Collection, ColorPalette, MonogramFont, FabricTexture, FabricColor, ZipperColor, LiningColor, PullerColor, BiasColor, EmbroideryColor } from '../../types';
import PlaceholderContent from '../PlaceholderContent';
import { cn } from '../../lib/utils';
import { useCategories } from '../../hooks/useCategories';
import { useCollections } from '../../hooks/useCollections';

const CATALOG_TABS = [
  { id: 'categories', label: 'Categorias & Coleções', icon: BookOpen },
  { id: 'personalization', label: 'Opções de Personalização', icon: Palette },
];

const PERSONALIZATION_SUB_TABS = [
    { id: 'tecido', label: 'Cores de Tecido', icon: Layers },
    { id: 'ziper', label: 'Cores de Zíper', icon: Link2 },
    { id: 'forro', label: 'Cores de Forro', icon: Layers },
    { id: 'puxador', label: 'Cores de Puxador', icon: Hand },
    { id: 'vies', label: 'Cores de Viés', icon: Scissors },
    { id: 'bordado', label: 'Cores de Bordado', icon: Paintbrush2 },
    { id: 'texturas', label: 'Texturas', icon: ScanSearch },
    { id: 'fontes_monogramas', label: 'Fontes p/ Monograma', icon: TypeIcon },
];


// --- Field Configurations ---
const categoryFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome da Categoria', type: 'text' }, { key: 'description', label: 'Descrição', type: 'textarea' }];
const collectionFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome da Coleção', type: 'text' }, { key: 'description', label: 'Descrição', type: 'textarea' }];
const colorFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome', type: 'text' }, { key: 'hex', label: 'Cor (Hex)', type: 'color' }, { key: 'is_active', label: 'Status', type: 'checkbox' }, ];
const embroideryColorFieldConfig: FieldConfig[] = [ ...colorFieldConfig, { key: 'thread_type', label: 'Tipo de Linha', type: 'select', options: [ {value: 'rayon', label: 'Rayon'}, {value: 'polyester', label: 'Polyester'}, {value: 'cotton', label: 'Algodão'}, {value: 'metallic', label: 'Metálica'}]} ];
const fontFieldConfig: FieldConfig[] = [ { key: 'name', label: 'Nome', type: 'text' }, { key: 'category', label: 'Categoria', type: 'select', options: [ {value: 'script', label: 'Script'}, {value: 'serif', label: 'Serif'}, {value: 'sans-serif', label: 'Sans-serif'}, {value: 'decorative', label: 'Decorativa'}, {value: 'handwritten', label: 'Manuscrita'}]}, { key: 'style', label: 'Estilo', type: 'select', options: [ {value: 'regular', label: 'Regular'}, {value: 'bold', label: 'Bold'}, {value: 'italic', label: 'Italic'}, {value: 'script', label: 'Script'}]}, { key: 'font_file_url', label: 'Arquivo da Fonte (.ttf, .otf)', type: 'file' }, { key: 'preview_url', label: 'URL da Imagem de Preview', type: 'text' }, { key: 'is_active', label: 'Status', type: 'checkbox' }, ];


const CatalogManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState(CATALOG_TABS[0].id);
    const [activePersonalizationSubTab, setActivePersonalizationSubTab] = useState(PERSONALIZATION_SUB_TABS[0].id);
    
    const { settingsData, isLoading: isSettingsLoading, isAdmin, handleAdd, handleUpdate, handleDelete } = useSettings();
    const { categories, addCategory, updateCategory, deleteCategory, isLoading: isCategoriesLoading } = useCategories();
    const { collections, addCollection, updateCollection, deleteCollection, isLoading: isCollectionsLoading } = useCollections();
    const isLoading = isSettingsLoading || isCategoriesLoading || isCollectionsLoading;

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
            case 'fontes_monogramas':
                if (!settingsData.catalogs.fontes_monogramas) return <PlaceholderContent title="Fontes para Monograma" requiredTable="config_fonts" />;
                return <TabContent<MonogramFont> category="catalogs" data={settingsData.catalogs.fontes_monogramas} fields={fontFieldConfig} {...createCrudHandlers('catalogs', 'fontes_monogramas')} isAdmin={isAdmin} title="Fontes para Monograma" />;

            case 'tecido':
                if (!settingsData.catalogs.cores_texturas.tecido) return <PlaceholderContent title="Cores de Tecido" requiredTable="fabric_colors" />;
                return <TabContent<FabricColor> category="catalogs" data={settingsData.catalogs.cores_texturas.tecido} fields={colorFieldConfig} {...createCrudHandlers('catalogs', 'cores_texturas', 'tecido')} isAdmin={isAdmin} title="Cores de Tecido" />;
            case 'ziper':
                if (!settingsData.catalogs.cores_texturas.ziper) return <PlaceholderContent title="Cores de Zíper" requiredTable="zipper_colors" />;
                return <TabContent<ZipperColor> category="catalogs" data={settingsData.catalogs.cores_texturas.ziper} fields={colorFieldConfig} {...createCrudHandlers('catalogs', 'cores_texturas', 'ziper')} isAdmin={isAdmin} title="Cores de Zíper" />;
            case 'forro':
                 if (!settingsData.catalogs.cores_texturas.forro) return <PlaceholderContent title="Cores de Forro" requiredTable="lining_colors" />;
                return <TabContent<LiningColor> category="catalogs" data={settingsData.catalogs.cores_texturas.forro} fields={colorFieldConfig} {...createCrudHandlers('catalogs', 'cores_texturas', 'forro')} isAdmin={isAdmin} title="Cores de Forro" />;
            case 'puxador':
                if (!settingsData.catalogs.cores_texturas.puxador) return <PlaceholderContent title="Cores de Puxador" requiredTable="puller_colors" />;
                return <TabContent<PullerColor> category="catalogs" data={settingsData.catalogs.cores_texturas.puxador} fields={colorFieldConfig} {...createCrudHandlers('catalogs', 'cores_texturas', 'puxador')} isAdmin={isAdmin} title="Cores de Puxador" />;
            case 'vies':
                 if (!settingsData.catalogs.cores_texturas.vies) return <PlaceholderContent title="Cores de Viés" requiredTable="bias_colors" />;
                return <TabContent<BiasColor> category="catalogs" data={settingsData.catalogs.cores_texturas.vies} fields={colorFieldConfig} {...createCrudHandlers('catalogs', 'cores_texturas', 'vies')} isAdmin={isAdmin} title="Cores de Viés" />;
            case 'bordado':
                 if (!settingsData.catalogs.cores_texturas.bordado) return <PlaceholderContent title="Cores de Bordado" requiredTable="embroidery_colors" />;
                return <TabContent<EmbroideryColor> category="catalogs" data={settingsData.catalogs.cores_texturas.bordado} fields={embroideryColorFieldConfig} {...createCrudHandlers('catalogs', 'cores_texturas', 'bordado')} isAdmin={isAdmin} title="Cores de Bordado" />;
            case 'texturas':
                if (!settingsData.catalogs.cores_texturas.texturas) return <PlaceholderContent title="Texturas de Tecido" requiredTable="fabric_textures" />;
                return <TabContent<FabricTexture> category="catalogs" data={settingsData.catalogs.cores_texturas.texturas} fields={textureFieldConfig} {...createCrudHandlers('catalogs', 'cores_texturas', 'texturas')} isAdmin={isAdmin} title="Texturas de Tecido" />;
            
            default: return null;
        }
    };

    const renderMainContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
        if (!settingsData) return <div className="text-center text-red-500">Falha ao carregar dados do catálogo.</div>;

        switch (activeTab) {
            case 'categories':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <TabContent<ProductCategory> title="Categorias de Produto" data={categories} fields={categoryFieldConfig} category="catalogs" onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} isAdmin={isAdmin} />
                        <TabContent<Collection> title="Coleções" data={collections} fields={collectionFieldConfig} category="catalogs" onAdd={addCollection} onUpdate={updateCollection} onDelete={deleteCollection} isAdmin={isAdmin} />
                    </div>
                );
            case 'personalization':
                return (
                    <div className="grid grid-cols-12 gap-6 items-start">
                        <div className="col-span-12 md:col-span-3">
                             <TabLayoutVertical tabs={PERSONALIZATION_SUB_TABS} activeTab={activePersonalizationSubTab} onTabChange={setActivePersonalizationSubTab} />
                        </div>
                        <div className="col-span-12 md:col-span-9">
                            {renderPersonalizationContent()}
                        </div>
                    </div>
                );
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

export default CatalogManagement;