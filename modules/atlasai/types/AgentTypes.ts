// modules/atlasai/types/AgentTypes.ts
export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'error' | 'offline';
  last_heartbeat: string;
  health_score: number;
}

export type AgentName =
  | 'ArquitetoSupremoAI'
  | 'IntegratorAI'
  | 'CatalisadorAI'
  | 'ExecutorAI'
  | 'AnalyticsAI'
  | 'VisualDesignerAI'
  | 'WebAppDevAI';

export interface TaskPacket {
  agent: AgentName;
  task: string;
  context: any;
}
