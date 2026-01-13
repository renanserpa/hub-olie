// modules/atlasai/core/registry.ts
import * as agents from './agents';
import { AgentName } from '../types/AgentTypes';

export const agentRegistry = new Map<AgentName, any>([
  ['ArquitetoSupremoAI', agents.arquitetoSupremoAI],
  ['IntegratorAI', agents.integratorAI],
  ['CatalisadorAI', agents.catalisadorAI],
  ['ExecutorAI', agents.executorAI],
  ['AnalyticsAI', agents.analyticsAI],
  ['VisualDesignerAI', agents.visualDesignerAI],
  ['WebAppDevAI', agents.webAppDevAI],
]);

export function getAgent(name: AgentName) {
  const agent = agentRegistry.get(name);
  if (!agent) {
    throw new Error(`Agent not found in registry: ${name}`);
  }
  return agent;
}
