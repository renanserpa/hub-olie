
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-secondary dark:bg-dark-secondary fixed inset-0 z-50">
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
        <p className="text-textPrimary dark:text-dark-textPrimary font-medium">Carregando...</p>
    </div>
);
