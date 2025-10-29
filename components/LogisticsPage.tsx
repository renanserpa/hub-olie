import React from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { useLogistics } from '../hooks/useLogistics';
import LogisticsTabs from './logistics/LogisticsTabs';
import QueuePanel from './logistics/QueuePanel';
import CreateWaveDialog from './logistics/CreateWaveDialog';
import ShipmentBoard from './logistics/ShipmentBoard';
import PickingPackingPanel from './logistics/PickingPackingPanel';
import SettingsPanel from './logistics/SettingsPanel';

const LogisticsPage: React.FC = () => {
    const {
        isLoading,
        activeTab,
        setActiveTab,
        pickingQueue,
        allShipments,
        isWaveDialogOpen,
        setIsWaveDialogOpen,
        createWave,
    } = useLogistics();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }

        switch (activeTab) {
            case 'queue':
                return (
                    <QueuePanel
                        orders={pickingQueue}
                        onNewWaveClick={() => setIsWaveDialogOpen(true)}
                    />
                );
            case 'picking':
                return <PickingPackingPanel />;
            case 'shipment':
                return <ShipmentBoard shipments={allShipments} />;
            case 'settings':
                return <SettingsPanel />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Truck className="text-primary" size={28} />
                        <h1 className="text-3xl font-bold text-textPrimary">Logística</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Gerencie o fluxo de separação, embalagem e expedição.</p>
                </div>
            </div>

            <LogisticsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="mt-6">
                {renderContent()}
            </div>

            <CreateWaveDialog
                isOpen={isWaveDialogOpen}
                onClose={() => setIsWaveDialogOpen(false)}
                orders={pickingQueue}
                onConfirm={createWave}
            />
        </div>
    );
};

export default LogisticsPage;