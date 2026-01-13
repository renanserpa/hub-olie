// services/vertexService.ts

// Mock do PredictionServiceClient do @google-cloud/aiplatform para o ambiente de frontend
const mockPredictionServiceClient = {
  predict: async (request: any) => {
    console.log("🤖 [VertexAI Mock] Recebida requisição de predição:", request);
    await new Promise(res => setTimeout(res, 800)); // Simula latência de rede
    const response = {
      predictions: [`Resposta mockada do Vertex AI para: "${request.instances[0].content}"`],
    };
    return [response];
  },
};

export async function vertexPredict(input: string): Promise<string> {
  const [response] = await mockPredictionServiceClient.predict({
    endpoint: "projects/olie-hub/locations/us-central1/endpoints/gemini-pro",
    instances: [{ content: input }],
  });
  return response.predictions[0];
}