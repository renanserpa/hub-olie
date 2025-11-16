// modules/atlasai/core/agents.ts
import { dataService } from '../../../services/dataService';
import { ProductionOrder, Task, _Order as _Order, _Product as _Product, _Contact as _Contact, _TaskStatus as _TaskStatus } from '../../../types';

// Base Agent Interface
interface IAgent {
  name: string;
  role: string;
  execute(task: string, context?: any): Promise<string>;
}

// --- Agent Implementations ---

/**
 * 🧠 ArquitetoSupremoAI: Gera arquitetura técnica e fluxos internos do módulo.
 */
class ArquitetoSupremoAI implements IAgent {
  name = "ArquitetoSupremoAI";
  role = "Gera arquitetura técnica e fluxos internos do módulo.";

  async execute(task: string, context?: any): Promise<string> {
    console.log(`[${this.name}] Executing task: ${task}`, context);
    await new Promise(resolve => setTimeout(resolve, 800));
    const output = `Technical blueprint for '${task}' created successfully.`;
    console.log(`[${this.name}] Output: ${output}`);
    return output;
  }
}

/**
 * 🔗 IntegratorAI: Implementa conexões entre módulos (APIs e eventos).
 */
class IntegratorAI implements IAgent {
  name = "IntegratorAI";
  role = "Implementa conexões entre módulos (APIs e eventos).";

  async execute(task: string, context?: any): Promise<string> {
    console.log(`[${this.name}] Executing task: ${task}`, context);
    const { moduleA = 'ModuleA', moduleB = 'ModuleB' } = context || {};
    await new Promise(resolve => setTimeout(resolve, 600));
    const output = `Integration points for '${moduleA}' and '${moduleB}' established.`;
    console.log(`[${this.name}] Output: ${output}`);
    return output;
  }
}

/**
 * 🧩 CatalisadorAI: Expande as capacidades cognitivas do sistema.
 */
class CatalisadorAI implements IAgent {
  name = "CatalisadorAI";
  role = "Expande as capacidades cognitivas do sistema.";

  async execute(task: string, context?: any): Promise<string> {
    console.log(`[${this.name}] Executing task: ${task}`, context);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const output = `Cognitive analysis for '${task}' complete. New insights generated.`;
    console.log(`[${this.name}] Output: ${output}`);
    return output;
  }
}

/**
 * ⚙️ ExecutorAI: Gera artefatos, logs e executa tarefas automatizadas.
 */
class ExecutorAI implements IAgent {
  name = "ExecutorAI";
  role = "Gera artefatos, logs e executa tarefas automatizadas.";

  async execute(task: string, context?: any): Promise<string> {
    console.log(`[${this.name}] Executing task: ${task}`, context);

    if (task === 'create_production_order_from_order_number') {
        const orderNumber = context?.orderNumber;
        if (!orderNumber) {
            throw new Error("Order number is required for this task.");
        }

        const allOrders = await dataService.getOrders();
        const order = allOrders.find(o => o.number === orderNumber);

        if (!order) {
            throw new Error(`Order ${orderNumber} not found.`);
        }
        
        const allProducts = await dataService.getProducts();
        const allTaskStatuses = await dataService.getTaskStatuses();
        const allTasks = await dataService.getTasks();
        const firstStatus = allTaskStatuses.sort((a,b) => a.position - b.position)[0];

        let createdItems = 0;
        for (const item of order.items) {
             const poNumber = `OP-AI-${order.number.split('-')[2]}-${item.id.slice(0,2)}`;
             const product = allProducts.find(p => p.id === item.product_id);
             
             const newPO: Omit<ProductionOrder, 'id'> = {
                po_number: poNumber,
                product_id: item.product_id,
                quantity: item.quantity,
                status: 'novo',
                priority: 'normal',
                due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
             };
             await dataService.addDocument('production_orders', newPO);

             if(firstStatus) {
                const newTask: Omit<Task, 'id'> = {
                    title: `${poNumber} - ${product?.name}`,
                    status_id: firstStatus.id,
                    client_name: order.customers?.name || 'N/A',
                    quantity: item.quantity,
                    position: allTasks.filter(t => t.status_id === firstStatus.id).length + createdItems,
                    priority: 'normal',
                };
                await dataService.addDocument('tasks', newTask);
             }
             createdItems++;
        }
        
        const output = `Successfully created ${createdItems} production order(s) and task(s) for order ${orderNumber}.`;
        console.log(`[${this.name}] Output: ${output}`);
        return output;
    }

    const { runId = 'default-run' } = context || {};
    await new Promise(resolve => setTimeout(resolve, 400));
    const output = `Artifacts and logs for task '${task}' generated at /runs/${runId}.`;
    console.log(`[${this.name}] Output: ${output}`);
    return output;
  }
}

/**
 * 💡 AnalyticsAI: Monitora e avalia o desempenho do módulo e dos agentes.
 */
class AnalyticsAI implements IAgent {
  name = "AnalyticsAI";
  role = "Monitora e avalia o desempenho do módulo e dos agentes.";

  async execute(task: string, context?: any): Promise<string> {
    console.log(`[${this.name}] Executing task: ${task}`, context);
    const { module = 'System' } = context || {};
    await new Promise(resolve => setTimeout(resolve, 500));
    const output = `Performance report for '${module}' generated. Health: 98%.`;
    console.log(`[${this.name}] Output: ${output}`);
    return output;
  }
}

/**
 * 🎨 VisualDesignerAI: Define interface visual e painel administrativo do módulo.
 */
class VisualDesignerAI implements IAgent {
  name = "VisualDesignerAI";
  role = "Define interface visual e painel administrativo do módulo.";

  async execute(task: string, context?: any): Promise<string> {
    console.log(`[${this.name}] Executing task: ${task}`, context);
    await new Promise(resolve => setTimeout(resolve, 700));
    const output = `UI mockups for '${task}' created. Theme: OlieHub standard.`;
    console.log(`[${this.name}] Output: ${output}`);
    return output;
  }
}

/**
 * 👷 WebAppDevAI: Cria componentes, hooks e endpoints internos no Next.js/Supabase.
 */
class WebAppDevAI implements IAgent {
  name = "WebAppDevAI";
  role = "Cria componentes, hooks e endpoints internos no Next.js/Supabase.";

  async execute(task: string, context?: any): Promise<string> {
    console.log(`[${this.name}] Executing task: ${task}`, context);
    const { componentName = 'NewComponent' } = context || {};
    await new Promise(resolve => setTimeout(resolve, 1200));
    const output = `Scaffolded React component '${componentName}' and hook 'use${componentName}'.`;
    console.log(`[${this.name}] Output: ${output}`);
    return output;
  }
}


// Export instances of each agent
export const arquitetoSupremoAI = new ArquitetoSupremoAI();
export const integratorAI = new IntegratorAI();
export const catalisadorAI = new CatalisadorAI();
export const executorAI = new ExecutorAI();
export const analyticsAI = new AnalyticsAI();
export const visualDesignerAI = new VisualDesignerAI();
export const webAppDevAI = new WebAppDevAI();
