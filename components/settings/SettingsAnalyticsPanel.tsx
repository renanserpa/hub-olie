import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { SystemSettingsHistory } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, BarChart2, User, Sparkles } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import StatCard from '../dashboard/StatCard';

const SettingsAnalyticsPanel: React.FC = () => {
    const [history, setHistory] = useState<SystemSettingsHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const listener = dataService.listenToCollection<SystemSettingsHistory>('system_settings_history', undefined, (data) => {
            setHistory(data);
            setIsLoading(false);
        });
        return () => listener.unsubscribe();
    }, []);

    const stats = useMemo(() => {
        const totalChanges = history.length;
        const aiChanges = history.filter(h => h.changed_by === 'AI').length;
        const userChanges = totalChanges - aiChanges;
        const aiPercentage = totalChanges > 0 ? ((aiChanges / totalChanges) * 100).toFixed(0) + '%' : '0%';
        
        const mostChangedKey = history.length > 0 ? 
            Object.entries(history.reduce((acc, h) => {
                acc[h.setting_key] = (acc[h.setting_key] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)).sort((a,b) => b[1] - a[1])[0][0]
            : 'N/A';

        return { totalChanges, aiChanges, userChanges, aiPercentage, mostChangedKey };
    }, [history]);
    
    const pieData = [{ name: 'Usuário', value: stats.userChanges }, { name: 'IA', value: stats.aiChanges }];
    const COLORS = ['#D2A66D', '#34D399'];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
    
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total de Alterações" value={stats.totalChanges} icon={BarChart2} />
                <StatCard title="Alterações Manuais" value={stats.userChanges} icon={User} />
                <StatCard title="Ajustes por IA" value={stats.aiChanges} icon={Sparkles} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Origem das Alterações</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} (${((Number(value) / stats.totalChanges) * 100).toFixed(0)}%)`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsAnalyticsPanel;
