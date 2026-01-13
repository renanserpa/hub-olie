// services/nanoAgentService.ts

// Mock da biblioteca fictícia @google/nanoai e da classe BananaRuntime
class MockBananaRuntime {
  constructor(config: { model: string }) {
    console.log(`🍌 [NanoBanana Mock] Inicializando modelo: ${config.model}`);
  }

  async run(params: { task: string; input: string; maxOutputTokens: number }) {
    console.log(`🍌 [NanoBanana Mock] Executando tarefa "${params.task}"`);
    await new Promise(res => setTimeout(res, 150)); // Simula inferência local rápida
    return `Resumo (Nano) para: "${params.input.substring(0, 50)}..."`;
  }
}

export const runLocalNanoModel = async (input: string): Promise<string> => {
  const model = new MockBananaRuntime({ model: "gemini-nano-edge" });
  const output = await model.run({
    task: "summarization",
    input,
    maxOutputTokens: 256,
  });
  return output;
};