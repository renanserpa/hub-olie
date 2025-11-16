import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, LogisticsWave, LogisticsShipment, LogisticsTab, LogisticsPickTask } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useApp } from '../contexts/AppContext';

export function useLogistics() {
    const { user } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<LogisticsTab>('queue');
    
    // Data states
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [allWaves, setAllWaves] = useState<LogisticsWave[]>([]);
    const [allShipments, setAllShipments] = useState<LogisticsShipment[]>([]);
    const [allPickTasks, setAllPickTasks] = useState<LogisticsPickTask[]>([]);
    
    // UI states
    const [isWaveDialogOpen, setIsWaveDialogOpen] = useState(false);

    const isAdmin = user?.role === 'AdminGeral' || user?.role === 'Administrativo';

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { orders, waves, shipments, pickTasks } = await dataService.getLogisticsData();
            setAllOrders(orders as Order[]);
            setAllWaves(waves);
            setAllShipments(shipments);
            setAllPickTasks(pickTasks);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os dados de logística.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        // FIX: Added the 4th argument to match the expected signature of `listenToCollection`.
        const ordersListener = dataService.listenToCollection('orders', undefined, () => {
            console.log('Realtime update on orders detected for logistics, refreshing...');
            loadData();
        }, setAllOrders);

        // FIX: Added the 4th argument to match the expected signature of `listenToCollection`.
        const wavesListener = dataService.listenToCollection('logistics_waves', undefined, () => {
            console.log('Realtime update on logistics_waves detected, refreshing...');
            loadData();
        }, setAllWaves);

        return () => {
            ordersListener.unsubscribe();
            wavesListener.unsubscribe();
        };
    }, [loadData]);

    const pickingQueue = useMemo(() => {
        const ordersInWaves = new Set(allWaves.flatMap(w => w.order_ids));
        return allOrders.filter(order =>
            (order.status === 'paid' || order.status === 'in_production') && !ordersInWaves.has(order.id)
        );
    }, [allOrders, allWaves]);

    const createWave = async (orderIds: string[]) => {
        if (!isAdmin) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para esta ação.', variant: 'destructive' });
            return;
        }
        try {
            const waveNumber = `WAVE-${new Date().getFullYear()}-${String(allWaves.length + 1).padStart(4, '0')}`;
            const newWave: Omit<LogisticsWave, 'id'> = {
                wave_number: waveNumber,
                status: 'pending',
                order_ids: orderIds,
                created_by: user!.id,
                created_at: new Date().toISOString(),
            };
            await dataService.addDocument('logistics_waves', newWave);
            toast({ title: 'Sucesso!', description: `Onda ${waveNumber} criada com ${orderIds.length} pedidos.` });
            setIsWaveDialogOpen(false);
            loadData(); // Refresh data
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível criar a onda de separação.', variant: 'destructive' });
        }
    };

    return {
        isLoading,
        isAdmin,
        activeTab,
        setActiveTab,
        
        // Data for UI
        pickingQueue,
        allWaves,
        allShipments,
        allPickTasks,

        // Dialogs and Actions
        isWaveDialogOpen,
        setIsWaveDialogOpen,
        createWave,
    };
}