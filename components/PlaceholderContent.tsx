import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Wrench } from 'lucide-react';

interface PlaceholderContentProps {
  title: string;
  requiredTable: string;
  icon?: React.ElementType;
}

const PlaceholderContent: React.FC<PlaceholderContentProps> = ({ title, requiredTable, icon: Icon = Wrench }) => {
    return (
        <Card>
            <CardContent>
                <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                    <Icon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-textPrimary">{title}</h3>
                    <p className="mt-1 text-sm text-textSecondary">Esta funcionalidade está em desenvolvimento.</p>
                    <p className="mt-1 text-xs text-textSecondary font-mono bg-secondary px-2 py-1 rounded">
                        (Requer a criação da tabela: `{requiredTable}`)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PlaceholderContent;
