

import { useState } from 'react';
import { toast } from './use-toast';
import { Contact, FiscalDetails, LogisticsDetails, PaymentDetails } from '../types';

// Mock API delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function useTinyApi() {
  const [loading, setLoading] = useState(false);
  
  const callMockApi = async <T>(functionName: string, mockResult: T, successMessage: string): Promise<T | null> => {
    setLoading(true);
    console.log(`Calling mock API: ${functionName}`);
    try {
      await delay(1000 + Math.random() * 500); // Simulate network latency
      // toast({ title: "Sucesso (Mock)", description: _successMessage });
      return mockResult;
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    createPaymentLink: (orderId: string, amount: number, description: string, customer: Contact) => {
      const mockPaymentDetails: PaymentDetails = {
          status: 'pending',
          method: 'link',
          checkoutUrl: `https://mock-checkout.com/pay?id=${Date.now()}`,
          transactionId: `txn_${Date.now()}`
      };
      return callMockApi<{ payments: PaymentDetails }>('createPaymentLink', { payments: mockPaymentDetails }, 'Link de pagamento gerado.');
    },
    
    issueNFe: (orderId: string) => {
        const mockFiscalDetails: FiscalDetails = {
            status: 'authorized',
            nfeNumber: (Math.floor(Math.random() * 90000) + 10000).toString(),
            serie: '1',
            pdfUrl: '#',
            xmlUrl: '#'
        };
        return callMockApi<{ fiscal: FiscalDetails }>('issueNFe', { fiscal: mockFiscalDetails }, 'NFe emitida com sucesso.');
    },
        
    createShippingLabel: (orderId: string) => {
      const mockLogisticsDetails: LogisticsDetails = {
          status: 'in_transit',
          carrier: 'Mock Transportadora',
          service: 'Express',
          tracking: `MOCK${Date.now()}`,
          labelUrl: '#'
      };
       return callMockApi<{ logistics: LogisticsDetails }>('createShippingLabel', { logistics: mockLogisticsDetails }, 'Etiqueta de envio gerada.');
    }
  };
}