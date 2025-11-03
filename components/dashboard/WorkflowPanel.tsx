import React from 'react';
import PlaceholderContent from '../PlaceholderContent';
import { GitBranch } from 'lucide-react';

const WorkflowPanel: React.FC = () => {
    return (
        <PlaceholderContent
            title="Motor de Automação de Fluxos"
            requiredTable="workflow_triggers"
            icon={GitBranch}
        >
            <p className="mt-1 text-sm text-textSecondary">
                Interface para criação e monitoramento de automações entre módulos.
                <br />
                (Ex: Pedido pago → Gera OP → Dispara expedição).
            </p>
        </PlaceholderContent>
    );
};

export default WorkflowPanel;
