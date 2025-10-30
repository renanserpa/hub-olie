import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Wrench } from 'lucide-react';

interface PlaceholderContentProps {
  title: string;
  requiredTable: string;
  icon?: React.ElementType;
  children?: React.ReactNode;
}

const PlaceholderContent: React.FC<PlaceholderContentProps> = ({ title, requiredTable, icon: Icon = Wrench, children }) => {
    return (
        <Card>
            <CardContent>
                <div className="text-center text-textSecondary dark:text-dark-textSecondary py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl">
                    <Icon className="mx-auto h-12 w-12 text-textSecondary/60 dark:text-dark-textSecondary/60" />
                    <h3 className="mt-4 text-lg font-medium text-textPrimary dark:text-dark-textPrimary">{title}</h3>
                    {children || <p className="mt-1 text-sm text-textSecondary dark:text-dark-textSecondary">Esta funcionalidade está em desenvolvimento.</p>}
                    <p className="mt-1 text-xs text-textSecondary dark:text-dark-textSecondary font-mono bg-secondary dark:bg-dark-secondary px-2 py-1 rounded">
                        (Requer a criação da tabela: `{requiredTable}`)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PlaceholderContent;