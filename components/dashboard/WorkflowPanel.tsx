import React from 'react';
import { useWorkflows } from '../../hooks/useWorkflows';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, GitBranch, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';

const WorkflowPanel: React.FC = () => {
    const { rules, isLoading } = useWorkflows();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><GitBranch size={20}/> Automação de Fluxos</CardTitle>
                <Button><Plus className="w-4 h-4 mr-2"/> Nova Regra</Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-textSecondary mb-4">Gerencie regras que automatizam tarefas entre módulos.</p>
                <div className="space-y-3">
                    {rules.map(rule => (
                        <div key={rule.id} className="p-4 border rounded-lg flex items-start gap-4">
                            <Zap className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold">{rule.name}</h4>
                                <p className="text-sm text-textSecondary">{rule.description}</p>
                                <div className="mt-2 text-xs font-mono text-textSecondary/80">
                                    <span className="font-semibold">Gatilho:</span> {rule.trigger} &rarr; <span className="font-semibold">Ação:</span> {rule.action}
                                </div>
                            </div>
                            <Badge variant={rule.is_active ? 'ativo' : 'inativo'}>
                                {rule.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                    ))}
                </div>
                 <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-lg border-t mt-6">
                    🚧 A criação e edição de regras (React Flow) está em desenvolvimento.
                </div>
            </CardContent>
        </Card>
    );
};

export default WorkflowPanel;