import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart2 } from 'lucide-react';

const ChartCard: React.FC<{ title: string }> = ({ title }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-64 flex flex-col items-center justify-center text-center text-textSecondary bg-secondary rounded-lg">
                <BarChart2 className="w-10 h-10 text-primary/70 mb-2" />
                <p className="text-sm font-medium">Visualização de Gráfico</p>
                <p className="text-xs">Componente de gráfico em desenvolvimento.</p>
            </div>
        </CardContent>
    </Card>
);

export default ChartCard;