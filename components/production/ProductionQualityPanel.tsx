import React from 'react';
import { ProductionQualityCheck } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProductionQualityPanelProps {
    checks: ProductionQualityCheck[];
    onCreate: (check: any) => void;
}

const ProductionQualityPanel: React.FC<ProductionQualityPanelProps> = ({ checks, onCreate }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    Controle de Qualidade
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-lg">
                    🚧 A interface completa para registrar inspeções, checklists e aprovações de qualidade está em desenvolvimento.
                </div>
                <div className="mt-4">
                    <Button disabled>Registrar Nova Inspeção</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductionQualityPanel;