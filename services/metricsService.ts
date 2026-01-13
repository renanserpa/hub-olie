// This service simulates fetching aggregated operational metrics from the database.
// In a real application, this would query a dedicated analytics table or perform complex joins.

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getOperationalMetrics(): Promise<{
    freight_cost_avg: number;
    order_avg_value: number;
    production_delay_avg: number;
}> {
    console.log("📊 [metricsService] Fetching operational metrics...");
    await delay(400); // Simulate network latency

    // In a real scenario, these values would come from complex SQL queries.
    // For this simulation, we return values that will trigger the AI rules.
    const metrics = {
        freight_cost_avg: 65.50,         // This is > 50, so it will trigger the freight_free_threshold rule.
        order_avg_value: 350.20,
        production_delay_avg: 3.1,     // This is > 2, so it will trigger the priority_production_mode rule.
    };
    
    console.log("📊 [metricsService] Metrics fetched:", metrics);
    return metrics;
}
