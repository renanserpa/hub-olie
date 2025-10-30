import React from 'react';
import { Megaphone } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon: Icon = Megaphone }) => {
    return (
        <div className="text-center text-textSecondary dark:text-dark-textSecondary py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl">
            <Icon className="mx-auto h-12 w-12 text-textSecondary/60 dark:text-dark-textSecondary/60" />
            <h3 className="mt-4 text-lg font-medium text-textPrimary dark:text-dark-textPrimary">{title}</h3>
            <p className="mt-1 text-sm text-textSecondary dark:text-dark-textSecondary">{message}</p>
        </div>
    );
};

export default EmptyState;