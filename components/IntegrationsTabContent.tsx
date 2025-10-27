import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Info } from 'lucide-react';

const integrations = [
    {
        title: 'Pagamentos',
        description: 'Integração com Mercado Pago/Stripe em breve',
        status: 'Em breve',
    },
    {
        title: 'Envios',
        description: 'Integração com Correios/Melhor Envio em breve',
        status: 'Em breve',
    },
    {
        title: 'WhatsApp Business',
        description: 'Conecte sua conta WhatsApp para enviar mensagens',
        status: 'Em breve',
    },
    {
        title: 'Instagram',
        description: 'Integre com Instagram Direct para atendimento',
        status: 'Em breve',
    },
]

const IntegrationsTabContent: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
                 <Card key={integration.title}>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                             <h3 className="text-lg font-bold text-textPrimary">{integration.title}</h3>
                             {integration.status && <Badge variant="secondary">{integration.status}</Badge>}
                        </div>
                        <div className="flex items-center text-sm text-textSecondary mt-4">
                          <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                          <p>{integration.description}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default IntegrationsTabContent;
