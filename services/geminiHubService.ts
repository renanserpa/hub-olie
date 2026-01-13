// services/geminiHubService.ts
import { GeminiHubRequest, GeminiHubResponse, GoogleService } from '../hub-initializer/schemas/gemini_hub';
import { vertexPredict } from './vertexService';
import { runLocalNanoModel } from './nanoAgentService';

// Este é um orquestrador de alto nível. As implementações reais seriam mais complexas.
const serviceMap: Record<GoogleService, (action: string, payload: any) => Promise<any>> = {
    gemini: async (action, payload) => { console.log("🤖 [Gemini] Ação:", action, payload); return "Ação do Gemini executada"; },
    vertex: async (action, payload) => vertexPredict(payload.input),
    nano: async (action, payload) => runLocalNanoModel(payload.input),
    firebase: async (action, payload) => { console.log("🔥 [Firebase] Ação:", action, payload); return "Ação do Firebase executada"; },
    drive: async (action, payload) => { console.log("💾 [Drive] Ação:", action, payload); return "Ação do Drive executada"; },
    bigquery: async (action, payload) => { console.log("📊 [BigQuery] Ação:", action, payload); return "Ação do BigQuery executada"; },
    sheets: async (action, payload) => { console.log("📜 [Sheets] Ação:", action, payload); return "Ação do Sheets executada"; },
    appscript: async (action, payload) => { console.log("⚙️ [AppScript] Ação:", action, payload); return "Ação do AppScript executada"; },
    cloudfunctions: async (action, payload) => { console.log("☁️ [CloudFunctions] Ação:", action, payload); return "Ação do CloudFunctions executada"; },
};

export const geminiHubService = {
  async routeRequest(request: GeminiHubRequest): Promise<GeminiHubResponse> {
    const handler = serviceMap[request.service];
    if (!handler) {
      const errorMsg = `Serviço "${request.service}" não encontrado.`;
      console.error(`[GeminiHub] ${errorMsg}`);
      return {
        service: request.service,
        status: 'error',
        data: null,
        error: errorMsg,
      };
    }

    try {
      const data = await handler(request.action, request.payload);
      return {
        service: request.service,
        status: 'success',
        data,
      };
    } catch (e) {
      const errorMsg = (e as Error).message;
       console.error(`[GeminiHub] Erro no serviço ${request.service}:`, errorMsg);
      return {
        service: request.service,
        status: 'error',
        data: null,
        error: errorMsg,
      };
    }
  },
};