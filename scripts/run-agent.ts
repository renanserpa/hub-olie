#!/usr/bin/env ts-node
import { executeAgent } from '../hub-initializer/services/crewSyncService';

async function main() {
  const agent = process.argv[2] || 'ArquitetoSupremo';
  const action = process.argv[3] || 'audit';
  const context = process.argv[4] || 'orders';

  console.log(`Running agent=${agent} action=${action} context=${context}`);
  const res = await executeAgent(agent, { action, context, report: `report-${context}.md` });
  console.log('Result:', res);
}

main().catch((e) => {
  console.error('Erro ao rodar agente:', e);
  process.exit(1);
});
