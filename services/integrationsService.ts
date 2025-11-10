import { Order, PaymentDetails, FiscalDetails, LogisticsDetails } from "../types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = () => Math.random().toString(36).substring(2, 10);

export const integrationsService = {
  generatePaymentLink: async (order: Order): Promise<{ payments: PaymentDetails }> => {
    await delay(600);
    console.log(`[INTEGRATION MOCK] Mocking payment link for order #${order.number}`);
    return {
        payments: {
            status: 'pending',
            method: 'link',
            checkoutUrl: `https://mock.olie.com/pay/${generateId()}`,
            transactionId: `txn_mock_${generateId()}`
        }
    };
  },

  issueNFe: async (order: Order): Promise<{ fiscal: FiscalDetails }> => {
    await delay(800);
    console.log(`[INTEGRATION MOCK] Mocking NFe for order #${order.number}`);
    return {
        fiscal: {
            status: 'authorized',
            nfeNumber: String(Math.floor(100000 + Math.random() * 900000)),
            serie: '1',
            pdfUrl: '#mock-danfe',
            xmlUrl: '#mock-xml'
        }
    };
  },

  createShippingLabel: async (order: Order): Promise<{ logistics: LogisticsDetails }> => {
    await delay(500);
    console.log(`[INTEGRATION MOCK] Mocking shipping label for order #${order.number}`);
    return {
        logistics: {
            status: 'shipped',
            carrier: 'Correios (Mock)',
            service: 'SEDEX',
            tracking: `MCK${Date.now()}BR`,
            labelUrl: '#mock-label'
        }
    };
  }
};