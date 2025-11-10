import React from 'react';
import { ProductionQualityCheck } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ShieldCheck, Check, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface ProductionQualityPanelProps {
    checks: ProductionQualityCheck[];
}

const ProductionQualityPanel: React.FC<ProductionQualityPanelProps> = ({ checks }) => {
    
    const qualityResultConfig = {
        'Aprovado': { badge: 'bg-green-100 text-green-800', icon: Check },
        'Reprovado': { badge: 'bg-red-100 text-red-800', icon: X },
        'Pendente': { badge: 'bg-yellow-100 text-yellow-800', icon: ShieldCheck },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck size={18}/> Painel de Controle de Qualidade</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-textSecondary mb-4">Lista de todas as inspeções de qualidade registradas no sistema.</p>
                {checks && checks.length > 0 ? (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {checks.map(check => {
                            const config = qualityResultConfig[check.result] || qualityResultConfig['Pendente'];
                            const Icon = config.icon;
                            return (
                                <div key={check.id} className="p-3 border rounded-lg bg-secondary/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold">OP: {check.production_order_id.slice(0, 8)}...</p>
                                            <p className="text-xs text-textSecondary">Inspetor: {check.inspector}</p>
                                        </div>
                                        <Badge className={cn(config.badge, 'flex items-center gap-1')}>
                                            <Icon size={12} />
                                            {check.result}
                                        </Badge>
                                    </div>
                                    {check.notes && <p className="text-sm mt-2 pt-2 border-t">{check.notes}</p>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">Nenhuma Inspeção Registrada</h3>
                        <p className="mt-1 text-sm text-textSecondary">Ainda não há registros de controle de qualidade.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductionQualityPanel;
