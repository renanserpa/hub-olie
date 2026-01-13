import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">{title}</CardTitle>
                <Icon className="h-4 w-4 text-textSecondary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-textSecondary">{description}</p>}
            </CardContent>
        </Card>
    );
};

export default StatCard;
