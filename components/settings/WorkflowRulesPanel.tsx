import React from 'react';
import { useWorkflows } from '../../hooks/useWorkflows';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, Zap, BrainCircuit } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

const WorkflowRulesPanel: React.FC = () => {
    const { rules, isLoading, updateRuleStatus } = useWorkflows();

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Regras de Automação</CardTitle>
                <p className="text-sm text-textSecondary">Ative ou desative fluxos de trabalho automáticos do sistema.</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {rules.map(rule => {
                        const isCognitive = rule.type === 'cognitive';
                        return (
                            <div key={rule.id} className="p-4 border rounded-lg flex items-start gap-4">
                                {isCognitive ? (
                                    // FIX: The `title` prop is not valid on Lucide icons. Wrapped with a span to provide a tooltip.
                                    <span title="Regra Cognitiva (IA)">
                                        <BrainCircuit className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                                    </span>
                                ) : (
                                    // FIX: The `title` prop is not valid on Lucide icons. Wrapped with a span to provide a tooltip.
                                    <span title="Regra Padrão">
                                        <Zap className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                    </span>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-semibold">{rule.name}</h4>
                                    <p className="text-sm text-textSecondary">{rule.description}</p>
                                    <div className="mt-2 text-xs font-mono text-textSecondary/80">
                                        <span className="font-semibold">Gatilho:</span> {rule.trigger} &rarr; <span className="font-semibold">Ação:</span> {rule.action}
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={rule.is_active} onChange={(e) => updateRuleStatus(rule.id, e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default WorkflowRulesPanel;