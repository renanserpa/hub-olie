import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface KpiAnomalyBadgeProps {
    isAnomaly: boolean;
    reason: string;
}

const KpiAnomalyBadge: React.FC<KpiAnomalyBadgeProps> = ({ isAnomaly, reason }) => {
    if (!isAnomaly) return null;

    return (
        <div className="relative group">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {reason}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
            </div>
        </div>
    );
};

export default KpiAnomalyBadge;
