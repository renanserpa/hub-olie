import { getOperationalMetrics } from "./metricsService";
import { dataService } from "./dataService";

interface SettingUpdate {
  key: string;
  newValue: any;
  confidence: number;
  explanation: string;
}

export async function dynamicConfigTuner(): Promise<SettingUpdate[]> {
  console.log("🤖 [aiTunerService] Starting dynamic configuration tuning...");
  const metrics = await getOperationalMetrics();
  const updates: SettingUpdate[] = [];

  // Rule 1: Predictive adjustment for free shipping based on sales trends (Idea #013)
  // This rule now simulates a more predictive logic.
  if (metrics.order_avg_value > 300) {
    const newThreshold = Math.round(metrics.order_avg_value * 1.15); // Predictively set it higher
    updates.push({
      key: "freight_params",
      newValue: {
          radius_km: 12, // Slightly adjusted based on trend
          base_fee: 15,
          fee_per_km: 2.5,
          free_shipping_threshold: newThreshold,
      },
      confidence: 0.88,
      explanation: `Com base no aumento das vendas e ticket médio (R$${metrics.order_avg_value.toFixed(2)}), prevemos que ajustar o limite de frete grátis para R$${newThreshold.toFixed(2)} manterá a lucratividade.`,
    });
  }

  // Rule 2: Predictive activation of priority production mode
  if (metrics.production_delay_avg > 2) {
    updates.push({
      key: "production_params", 
      newValue: {
          priority_production_mode: true,
          max_wip: 15, // Suggested new WIP limit
      },
      confidence: 0.92,
      explanation: `Atrasos na produção (${metrics.production_delay_avg.toFixed(1)} dias) indicam um futuro gargalo. Sugerindo ativar o modo de produção prioritária para mitigar o risco.`,
    });
  }

  console.log(`🤖 [aiTunerService] Identified ${updates.length} potential adjustments.`);

  // Return suggestions instead of applying them
  return updates;
}