
import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Shield } from 'lucide-react';

const SecurityTabContent: React.FC = () => (
    <Card>
        <CardContent>
            <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Segurança e Diagnósticos</h3>
                <p className="mt-1 text-sm text-textSecondary">Ferramentas de diagnóstico do sistema e gestão de acesso estarão disponíveis em breve.</p>
            </div>
        </CardContent>
    </Card>
);

export default SecurityTabContent;
