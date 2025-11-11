import React, { useState } from 'react';
import { useProduction } from './useProduction';
import { ProductionRoute, MoldLibrary, FieldConfig, AnySettingsItem } from '../../types';
import TabLayout from '../../components/ui/TabLayout';
import TabContent from '../../components/TabContent';
import { Route, Library } from 'lucide-react';

const TABS = [
  { id: 'routes', label: 'Rotas de Produção', icon: Route },
  { id: 'molds', label: 'Biblioteca de Moldes', icon: Library },
];

const routeFieldConfig: FieldConfig[] = [
    { key: 'produto', label: 'Produto', type: 'text' }, 
    { key: 'tamanho', label: 'Tamanho', type: 'text' }, 
    { key: 'rota', label: 'Rota (etapas, separado por vírgula)', type: 'textarea' }, 
    { key: 'tempos_std_min', label: 'Tempos Padrão (JSON)', type: 'textarea' }
];

const moldFieldConfig: FieldConfig[] = [
    { key: 'codigo', label: 'Código', type: 'text' }, 
    { key: 'produto', label: 'Produto Associado', type: 'text' }, 
    { key: 'descricao', label: 'Descrição', type: 'textarea' }, 
    { key: 'local_armazenamento', label: 'Local de Armazenamento', type: 'text' }
];

const ProductionSettingsPanel: React.FC = () => {
    const { 
        allRoutes, allMolds, 
        addRoute, updateRoute, deleteRoute,
        addMold, updateMold, deleteMold,
    } = useProduction();
    const [activeTab, setActiveTab] = useState('routes');
    
    const handleAddOrUpdate = (mutationFn: (item: any) => Promise<void>, item: any) => {
        const itemCopy = { ...item };
        if (itemCopy.rota && typeof itemCopy.rota === 'string') {
            itemCopy.rota = itemCopy.rota.split(',').map((s: string) => s.trim());
        }
        if (itemCopy.tempos_std_min && typeof itemCopy.tempos_std_min === 'string') {
            try {
                itemCopy.tempos_std_min = JSON.parse(itemCopy.tempos_std_min);
            } catch {
                // handle invalid JSON if necessary, maybe show a toast
            }
        }
        return mutationFn(itemCopy);
    };

    const routesForTable = allRoutes.map(r => ({...r, rota: Array.isArray(r.rota) ? r.rota.join(', ') : r.rota, tempos_std_min: typeof r.tempos_std_min === 'object' ? JSON.stringify(r.tempos_std_min, null, 2) : r.tempos_std_min }));

    const renderContent = () => {
        switch(activeTab) {
            case 'routes':
                return <TabContent 
                    title="Rotas de Produção"
                    category="sistema" // dummy category for type compliance
                    data={routesForTable as AnySettingsItem[]}
                    fields={routeFieldConfig}
                    onAdd={(item) => handleAddOrUpdate(addRoute, item)}
                    onUpdate={(item) => handleAddOrUpdate(updateRoute, item)}
                    onDelete={deleteRoute}
                    isAdmin={true} // assuming admin access if they can see this tab
                />;
            case 'molds':
                return <TabContent 
                    title="Biblioteca de Moldes"
                    category="sistema" // dummy
                    data={allMolds as AnySettingsItem[]}
                    fields={moldFieldConfig}
                    onAdd={addMold as any}
                    onUpdate={updateMold as any}
                    onDelete={deleteMold}
                    isAdmin={true}
                />;
            default: return null;
        }
    }
    
    return (
        <div>
            <TabLayout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default ProductionSettingsPanel;
