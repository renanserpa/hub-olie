import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Info, Cpu } from 'lucide-react';

const integrations = [
    {
        title: 'Pagamentos (Stripe/Mercado Pago)',
        description: 'Gere links de pagamento dinâmicos para seus pedidos.',
        status: 'Ativo (Simulado com IA)',
        variant: 'ativo' as const,
    },
    {
        title: 'Emissão Fiscal (NFe)',
        description: 'Simule a emissão de Notas Fiscais para seus pedidos.',
        status: 'Ativo (Simulado com IA)',
        variant: 'ativo' as const,
    },
    {
        title: 'Envios (Correios/Melhor Envio)',
        description: 'Crie etiquetas de envio com códigos de rastreio.',
        status: 'Ativo (Simulado com IA)',
        variant: 'ativo' as const,
    },
    {
        title: 'WhatsApp Business',
        description: 'Conecte sua conta para automações e atendimento.',
        status: 'Em breve',
        variant: 'secondary' as const,
    },
];

const IntegrationsTabContent: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
                 <Card key={integration.title}>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                             <h3 className="text-lg font-bold text-textPrimary">{integration.title}</h3>
                             {integration.status && <Badge variant={integration.variant}>{integration.status}</Badge>}
                        </div>
                        <div className="flex items-start text-sm text-textSecondary mt-4">
                          <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          <p>{integration.description}</p>
                        </div>
                         {integration.variant === 'ativo' && (
                            <div className="flex items-center text-xs text-primary mt-3 p-2 bg-primary/10 rounded-md">
                                <Cpu className="w-3 h-3 mr-2" />
                                <p>Esta integração é simulada dinamicamente via Gemini API.</p>
                            </div>
                         )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default IntegrationsTabContent;