// modules/atlasai/core/orchestrator.ts
import { getAgent } from './registry';
import { TaskPacket } from '../types/AgentTypes';

export async function runOrchestration(taskPackets: TaskPacket[]): Promise<string[]> {
  const results: string[] = [];
  console.log(`[Orchestrator] Starting orchestration with ${taskPackets.length} tasks.`);
  
  for (const packet of taskPackets) {
    try {
      const agent = getAgent(packet.agent);
      const result = await agent.execute(packet.task, packet.context);
      results.push(result);
    } catch (error) {
      const errorMessage = `[Orchestrator] Error executing task for ${packet.agent}: ${(error as Error).message}`;
      console.error(errorMessage);
      results.push(errorMessage);
      // Decide if the orchestration should stop on error
      // For now, it continues
    }
  }
  
  console.log('[Orchestrator] Orchestration finished.');
  return results;
}
