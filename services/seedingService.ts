import { dataService } from './dataService';
import {
    customersSeed,
    suppliersSeed,
    warehousesSeed,
    product_categoriesSeed,
    collectionsSeed,
    config_supply_groupsSeed,
    config_fontsSeed,
    fabric_colorsSeed,
    zipper_colorsSeed,
    bias_colorsSeed,
    embroidery_colorsSeed,
    config_materialsSeed,
    productsSeed,
    product_variantsSeed,
    ordersSeed,
    order_itemsSeed,
    production_ordersSeed,
    task_statusesSeed,
    tasksSeed,
    inventory_movementsSeed,
    inventory_balancesSeed,
    system_settingsSeed,
} from './sandboxDb';
import { toast } from '../hooks/use-toast';

// Helper function to remove the 'id' property from seed data,
// as the database will generate it automatically.
const sanitize = <T extends { id?: string }>(data: T[]): Omit<T, 'id'>[] => {
    return data.map(({ id, ...rest }) => rest);
};

export async function seedDatabase() {
    console.log("🚀 Iniciando o seed do banco de dados...");
    toast({ title: 'Iniciando Seed', description: 'Populando o banco de dados. Isso pode levar um momento...' });

    try {
        // --- Nível 1: Tabelas Independentes ---
        console.log("🌱 Nível 1: Tabelas Independentes...");
        await Promise.all([
            dataService.addManyDocuments('customers', sanitize(customersSeed)),
            dataService.addManyDocuments('suppliers', sanitize(suppliersSeed)),
            dataService.addManyDocuments('warehouses', sanitize(warehousesSeed)),
            dataService.addManyDocuments('product_categories', sanitize(product_categoriesSeed)),
            dataService.addManyDocuments('collections', sanitize(collectionsSeed)),
            dataService.addManyDocuments('config_supply_groups', sanitize(config_supply_groupsSeed)),
            dataService.addManyDocuments('config_fonts', sanitize(config_fontsSeed)),
            dataService.addManyDocuments('task_statuses', sanitize(task_statusesSeed)),
            dataService.addManyDocuments('system_settings', sanitize(system_settingsSeed)),
        ]);
        console.log("✅ Nível 1 concluído.");

        // --- Nível 2: Catálogos de Cores ---
        console.log("🌱 Nível 2: Catálogos de Cores...");
        await Promise.all([
            dataService.addManyDocuments('fabric_colors', sanitize(fabric_colorsSeed)),
            dataService.addManyDocuments('zipper_colors', sanitize(zipper_colorsSeed)),
            dataService.addManyDocuments('bias_colors', sanitize(bias_colorsSeed)),
            dataService.addManyDocuments('embroidery_colors', sanitize(embroidery_colorsSeed)),
        ]);
        console.log("✅ Nível 2 concluído.");
        
        // --- Nível 3: Tabelas com Dependências Simples ---
        console.log("🌱 Nível 3: Materiais, Produtos e Pedidos Base...");
        await dataService.addManyDocuments('config_materials', sanitize(config_materialsSeed));
        await dataService.addManyDocuments('products', sanitize(productsSeed));
        await dataService.addManyDocuments('orders', sanitize(ordersSeed as any));
        console.log("✅ Nível 3 concluído.");

        // --- Nível 4: Itens e Variações ---
        console.log("🌱 Nível 4: Itens de Pedido e Variações de Produto...");
        await dataService.addManyDocuments('product_variants', sanitize(product_variantsSeed));
        await dataService.addManyDocuments('order_items', sanitize(order_itemsSeed));
        console.log("✅ Nível 4 concluído.");

        // --- Nível 5: Ordens de Produção e Estoque ---
        console.log("🌱 Nível 5: Ordens de Produção, Tarefas e Estoque...");
        await dataService.addManyDocuments('production_orders', sanitize(production_ordersSeed));
        await dataService.addManyDocuments('tasks', sanitize(tasksSeed));
        await dataService.addManyDocuments('inventory_movements', sanitize(inventory_movementsSeed));
        await dataService.addManyDocuments('inventory_balances', sanitize(inventory_balancesSeed));
        console.log("✅ Nível 5 concluído.");

        console.log("🎉 Seed do banco de dados concluído com sucesso!");
        toast({ title: 'Sucesso!', description: 'Banco de dados populado com os dados de desenvolvimento. A página será recarregada.' });

    } catch (error) {
        console.error("🔥 Falha no processo de seed:", error);
        toast({ title: 'Erro no Seed!', description: (error as Error).message, variant: 'destructive' });
        throw error;
    }
}
