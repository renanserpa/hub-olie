import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-screen bg-secondary dark:bg-dark-secondary">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
);
