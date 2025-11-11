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

  // Rule 1: Adjust free shipping threshold based on high average freight cost
  if (metrics.freight_cost_avg > 50) {
    // Attempt to parse the freight_params to update it.
    // This is a simplified example. A real implementation might need a more robust way
    // to handle structured settings.
    const newThreshold = Math.round(metrics.order_avg_value * 1.2);
    updates.push({
      key: "freight_params",
      newValue: {
          radius_km: 10,
          base_fee: 15,
          fee_per_km: 2.5,
          free_shipping_threshold: newThreshold, // The adjusted value
      },
      confidence: 0.88,
      explanation: `Frete médio (R$${metrics.freight_cost_avg.toFixed(2)}) está elevado. Sugerindo aumento do limite para frete grátis para R$${newThreshold.toFixed(2)} para incentivar cestas maiores.`,
    });
  }

  // Rule 2: Activate priority production mode if delays are high
  // This rule assumes a setting 'priority_production_mode' exists or could be created.
  // For this demo, we'll create another update for freight_params to show multiple changes.
  if (metrics.production_delay_avg > 2) {
    updates.push({
      key: "production_params", 
      newValue: {
          priority_production_mode: true,
          max_wip: 15,
      },
      confidence: 0.92,
      explanation: `Atrasos na produção (${metrics.production_delay_avg.toFixed(1)} dias) detectados. Sugerindo ativar o modo de produção prioritária.`,
    });
  }

  console.log(`🤖 [aiTunerService] Identified ${updates.length} potential adjustments.`);

  // Return suggestions instead of applying them
  return updates;
}