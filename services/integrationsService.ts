import { GoogleGenAI, Type } from "@google/genai";
import { Order, PaymentDetails, FiscalDetails, LogisticsDetails } from "../types";
import { runtime } from '../lib/runtime';

// Fix: Property 'env' does not exist on type 'ImportMeta'. Use process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = () => Math.random().toString(36).substring(2, 10);

const callGeminiWithSchema = async <T>(prompt: string, schema: any): Promise<T> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.error('Error calling Gemini with schema:', error);
    throw new Error('Falha ao gerar dados de simulação com a IA.');
  }
};

const paymentSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, description: "O status do pagamento. Deve ser 'pending'." },
    method: { type: Type.STRING, description: "O método de pagamento. Deve ser 'link'." },
    checkoutUrl: { type: Type.STRING, description: "Uma URL de checkout fictícia e realista. Ex: https://secure.pagamentofacil.com/pay/aBc123XyZ" },
    transactionId: { type: Type.STRING, description: "Um ID de transação fictício. Ex: txn_1a2b3c4d5e6f" }
  },
  required: ['status', 'method', 'checkoutUrl', 'transactionId']
};

const fiscalSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, description: "O status fiscal. Deve ser 'authorized'." },
    nfeNumber: { type: Type.STRING, description: "Um número de Nota Fiscal fictício de 6 dígitos." },
    serie: { type: Type.STRING, description: "A série da NFe. Deve ser '1'." },
    pdfUrl: { type: Type.STRING, description: "Uma URL fictícia para um PDF de DANFE." },
    xmlUrl: { type: Type.STRING, description: "Uma URL fictícia para um XML de NFe." }
  },
  required: ['status', 'nfeNumber', 'serie', 'pdfUrl', 'xmlUrl']
};

const logisticsSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, description: "O status da logística. Deve ser 'shipped'." },
    carrier: { type: Type.STRING, description: "Uma transportadora brasileira conhecida. Ex: Correios, Jadlog." },
    service: { type: Type.STRING, description: "O tipo de serviço de frete. Ex: PAC, Sedex." },
    tracking: { type: Type.STRING, description: "Um código de rastreio fictício no formato da transportadora. Ex: QB123456789BR" },
    labelUrl: { type: Type.STRING, description: "Uma URL fictícia para a etiqueta de envio em PDF." }
  },
  required: ['status', 'carrier', 'service', 'tracking', 'labelUrl']
};

export const integrationsService = {
  generatePaymentLink: async (order: Order): Promise<{ payments: PaymentDetails }> => {
    if (runtime.mode === 'SANDBOX') {
        await delay(600);
        console.log(`🧱 SANDBOX: Mocking payment link for order #${order.number}`);
        return {
            payments: {
                status: 'pending',
                method: 'link',
                checkoutUrl: `https://sandbox.olie.com/pay/${generateId()}`,
                transactionId: `txn_sb_${generateId()}`
            }
        };
    }
    const prompt = `Simule a criação de um link de pagamento para o pedido ${order.number} no valor de R$ ${order.total.toFixed(2)}. Gere os dados no formato JSON especificado.`;
    const payments = await callGeminiWithSchema<PaymentDetails>(prompt, paymentSchema);
    return { payments };
  },

  issueNFe: async (order: Order): Promise<{ fiscal: FiscalDetails }> => {
    if (runtime.mode === 'SANDBOX') {
        await delay(800);
        console.log(`🧱 SANDBOX: Mocking NFe for order #${order.number}`);
        return {
            fiscal: {
                status: 'authorized',
                nfeNumber: String(Math.floor(100000 + Math.random() * 900000)),
                serie: '1',
                pdfUrl: '#mock-danfe',
                xmlUrl: '#mock-xml'
            }
        };
    }
    const prompt = `Simule a emissão de uma Nota Fiscal Eletrônica (NFe) para o pedido ${order.number} para o cliente ${order.customers?.name}. Gere os dados no formato JSON especificado.`;
    const fiscal = await callGeminiWithSchema<FiscalDetails>(prompt, fiscalSchema);
    return { fiscal };
  },

  createShippingLabel: async (order: Order): Promise<{ logistics: LogisticsDetails }> => {
    if (runtime.mode === 'SANDBOX') {
        await delay(500);
        console.log(`🧱 SANDBOX: Mocking shipping label for order #${order.number}`);
        return {
            logistics: {
                status: 'shipped',
                carrier: 'Correios (Sandbox)',
                service: 'SEDEX',
                tracking: `SB${Date.now()}BR`,
                labelUrl: '#mock-label'
            }
        };
    }
    const prompt = `Simule a criação de uma etiqueta de envio para o pedido ${order.number}. O cliente é ${order.customers?.name}. Gere os dados no formato JSON especificado.`;
    const logistics = await callGeminiWithSchema<LogisticsDetails>(prompt, logisticsSchema);
    return { logistics };
  }
};
