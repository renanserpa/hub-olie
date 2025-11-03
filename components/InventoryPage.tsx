import React, { useState } from 'react';
import { Package, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useInventory } from '../hooks/useInventory';
import InventoryBalanceList from './inventory/InventoryBalanceList';
import InventoryDetailPanel from './inventory/InventoryDetailPanel';
import { Card } from './ui/Card';
import InventoryMovementDialog from './inventory/InventoryMovementDialog';
import { InventoryKPIRow } from './inventory/InventoryKPIRow';
import { Material } from '../types';

const InventoryPage: React.FC = () => {
    const {
        isLoading,
        isLoadingMovements,
        isSaving,
        aggregatedBalances,
        searchQuery,
        setSearchQuery,
        balancesByMaterial,
        setSelectedMaterialId,
        movements,
        addInventoryMovement,
        transferStock,
        allMaterials,
        allWarehouses,
        kpiStats,
    } = useInventory();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSaveMovement = async (data: any) => {
        if (data.type === 'transfer') {
            await transferStock(data);
        } else {
            await addInventoryMovement(data);
        }
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
                    <p className="text-textSecondary mt-1">Consulte saldos, movimentações e transferências entre armazéns.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Movimento</Button>
                </div>
            </div>

            <div className="mb-6">
                <InventoryKPIRow stats={kpiStats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                     <InventoryBalanceList
                        balances={aggregatedBalances}
                        isLoading={isLoading}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedMaterialId={balancesByMaterial?.material.id || null}
                        onSelectMaterial={setSelectedMaterialId}
                     />
                </div>
                <div className="lg:col-span-5">
                    {balancesByMaterial ? (
                        <InventoryDetailPanel
                            key={balancesByMaterial.material.id}
                            material={balancesByMaterial.material}
                            balances={balancesByMaterial.balances}
                            movements={movements}
                            isLoading={isLoadingMovements}
                        />
                    ) : !isLoading ? (
                        <Card className="sticky top-20 h-[calc(100vh-18rem)] flex items-center justify-center">
                            <div className="text-center text-textSecondary">
                                <p>Selecione um material para ver os detalhes</p>
                            </div>
                        </Card>
                    ) : (
                         <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </div>
            <InventoryMovementDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveMovement}
                materials={allMaterials}
                warehouses={allWarehouses}
                isSaving={isSaving}
            />
        </div>
    );
};

export default InventoryPage;
