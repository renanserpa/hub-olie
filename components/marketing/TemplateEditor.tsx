import React from 'react';
import { MarketingTemplate } from '../../types';
import { Loader2, LayoutTemplate } from 'lucide-react';
import EmptyState from './EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TemplateEditorProps {
    templates: MarketingTemplate[];
    isLoading: boolean;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ templates, isLoading }) => {
    if (isLoading) {
        return (
            <div className="text-center py-10 flex items-center justify-center gap-2 text-textSecondary">
                <Loader2 className="h-5 w-5 animate-spin"/> Carregando templates...
            </div>
        );
    }

    if (templates.length === 0) {
        return <EmptyState 
            title="Nenhum Template" 
            message="Crie seu primeiro template de mensagem para usar em suas campanhas."
            icon={LayoutTemplate}
        />;
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Templates de Mensagens</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="p-4 font-semibold text-textSecondary">Nome</th>
                                <th className="p-4 font-semibold text-textSecondary">Canal</th>
                                <th className="p-4 font-semibold text-textSecondary">Prévia do Conteúdo</th>
                            </tr>
                        </thead>
                        <tbody>
                        {templates.map(template => (
                            <tr key={template.id} className="border-b border-border">
                                <td className="p-4 font-medium text-textPrimary">{template.name}</td>
                                <td className="p-4"><Badge variant="secondary" className="capitalize">{template.channel}</Badge></td>
                                <td className="p-4 text-textSecondary font-mono text-xs truncate max-w-sm">{template.content_preview}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                 <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-b-lg border-t">
                    🚧 O editor de templates está em desenvolvimento.
                </div>
            </CardContent>
        </Card>
    );
};

export default TemplateEditor;
