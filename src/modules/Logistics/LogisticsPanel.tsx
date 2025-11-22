
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLogistics } from '../../hooks/useLogistics';
import LogisticsTabs from '../../components/logistics/LogisticsTabs';
import QueuePanel from '../../components/logistics/QueuePanel';
import CreateWaveDialog from '../../components/logistics/CreateWaveDialog';
import ShipmentBoard from '../../components/logistics/ShipmentBoard';
import PickingPackingPanel from '../../components/logistics/PickingPackingPanel';
import SettingsPanel from '../../components/logistics/SettingsPanel';

const LogisticsPanel: React.FC = () => {
    const {
        isLoading,
        activeTab,
        setActiveTab,
        pickingQueue,
        allWaves,
        allPickTasks,
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
                return <PickingPackingPanel waves={allWaves} pickTasks={allPickTasks} />;
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

export default LogisticsPanel;
