import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Grid } from 'lucide-react';

const HeatmapPanel: React.FC<{ title: string }> = ({ title }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-64 flex flex-col items-center justify-center text-center text-textSecondary bg-secondary rounded-lg">
                <Grid className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Visualização de Heatmap</p>
                <p className="text-xs">Componente de heatmap em desenvolvimento.</p>
            </div>
        </CardContent>
    </Card>
);

export default HeatmapPanel;
