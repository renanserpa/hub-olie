import { useState, useEffect, useCallback } from 'react';
import { Order, Contact, Product, ProductionOrder, FinancePayable, FinanceReceivable, ActivityItem } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { ShoppingCart, Users, Workflow } from 'lucide-react';

export function useDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        orderCount: 0,
        contactCount: 0,
        productCount: 0,
        openProductionOrders: 0,
    });
    const [financeSummary, setFinanceSummary] = useState({
        upcomingReceivables: 0,
        overdueReceivables: 0,
        upcomingPayables: 0,
        overduePayables: 0,
    });
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [orders, contacts, products, productionOrders, financeData] = await Promise.all([
                dataService.getOrders(),
                dataService.getContacts(),
                dataService.getProducts(),
                dataService.getProductionOrders(),
                dataService.getFinanceData(),
            ]);

            // Set main stats
            setStats({
                orderCount: orders.length,
                contactCount: contacts.length,
                productCount: products.length,
                openProductionOrders: productionOrders.filter(po => po.status !== 'finalizado' && po.status !== 'cancelado').length,
            });
            
            // Set financial summary
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            const upcomingReceivables = financeData.receivables.filter(r => new Date(r.due_date) > now && new Date(r.due_date) <= thirtyDaysFromNow && r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
            const overdueReceivables = financeData.receivables.filter(r => new Date(r.due_date) < now && r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
            const upcomingPayables = financeData.payables.filter(p => new Date(p.due_date) > now && new Date(p.due_date) <= thirtyDaysFromNow && p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
            const overduePayables = financeData.payables.filter(p => new Date(p.due_date) < now && p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

            setFinanceSummary({ upcomingReceivables, overdueReceivables, upcomingPayables, overduePayables });

            // Create unified activity feed
            const orderActivities: ActivityItem[] = orders.slice(0, 5).map(order => ({
                id: order.id,
                type: 'order',
                timestamp: order.created_at,
                title: order.number,
                description: `Cliente: ${order.customers?.name || 'N/A'}`,
                value: `R$ ${order.total.toFixed(2)}`,
                icon: ShoppingCart,
            }));

            const contactActivities: ActivityItem[] = contacts.sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 3).map(contact => ({
                id: contact.id,
                type: 'contact',
                timestamp: contact.created_at || new Date().toISOString(),
                title: 'Novo Contato',
                description: contact.name,
                icon: Users,
            }));
            
            const productionActivities: ActivityItem[] = productionOrders.slice(0, 3).map(po => ({
                 id: po.id,
                 type: 'production',
                 timestamp: po.created_at,
                 title: 'Nova Ordem de Produção',
                 description: po.po_number,
                 value: `Qtd: ${po.quantity}`,
                 icon: Workflow,
            }));

            const combinedActivities = [...orderActivities, ...contactActivities, ...productionActivities]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 7);

            setActivityFeed(combinedActivities);

        } catch (error) {
            toast({ title: "Erro ao carregar Dashboard", description: "Não foi possível buscar os dados para o painel de controle.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { isLoading, stats, financeSummary, activityFeed, refresh: loadData };
}