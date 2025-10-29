import React, { useState } from 'react';
import { User } from '../types';
import { Package, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { useInventory } from '../hooks/useInventory';
import InventoryBalanceList from './inventory/InventoryBalanceList';
import InventoryDetailPanel from './inventory/InventoryDetailPanel';
import { Card } from './ui/Card';
import InventoryMovementDialog from './inventory/InventoryMovementDialog';

const InventoryPage: React.FC = () => {
    const {
        isLoading,
        isLoadingMovements,
        filteredBalances,
        searchQuery,
        setSearchQuery,
        selectedBalance,
        setSelectedMaterialId,
        movements,
// FIX: The hook returns `createMovement`, but the component was trying to use `addInventoryMovement`.
        createMovement,
        allMaterials,
    } = useInventory();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSaveMovement = async (data: any) => {
        await createMovement(data);
        setIsDialogOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div>
                    <div className="flex items-center gap-3">
                        <Package className="text-primary" size={28}/>
                        <h1 className="text-3xl font-bold text-textPrimary">Estoque</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Consulte saldos e movimentações de materiais.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Movimento</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                     <InventoryBalanceList
                        balances={filteredBalances}
                        isLoading={isLoading}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedMaterialId={selectedBalance?.material_id || null}
                        onSelectMaterial={setSelectedMaterialId}
                     />
                </div>
                <div className="lg:col-span-5">
                    {selectedBalance ? (
                        <InventoryDetailPanel
                            key={selectedBalance.material_id}
                            balance={selectedBalance}
                            movements={movements}
                            isLoading={isLoadingMovements}
                        />
                    ) : !isLoading ? (
                        <Card className="sticky top-20 h-[calc(100vh-10rem)] flex items-center justify-center">
                            <div className="text-center text-textSecondary">
                                <p>Selecione um material para ver os detalhes</p>
                            </div>
                        </Card>
                    ) : null}
                </div>
            </div>
            <InventoryMovementDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveMovement}
                materials={allMaterials}
            />
        </div>
    );
};

export default InventoryPage;
