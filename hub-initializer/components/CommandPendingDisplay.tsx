import React from 'react';
import { useInitializerContext } from '../../context/InitializerContext';
import { Button } from '../../components/ui/Button';
import { Copy, Send } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

export default function CommandPendingDisplay() {
    const { command, resolveCommand } = useInitializerContext();

    const handleCopy = () => {
        if (command) {
            navigator.clipboard.writeText(command);
            toast({ title: "Comando copiado!", description: "Cole no seu próximo prompt para o AI." });
        }
    };

    return (
        <div className="bg-card p-6 rounded-2xl shadow-lg dark:bg-dark-card border-2 border-primary animate-highlight-fade">
            <div className="text-center">
                <Send className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-textPrimary dark:text-dark-textPrimary">Comando Enviado à IA</h2>
                <p className="text-textSecondary dark:text-dark-textSecondary mb-4">
                    A solicitação abaixo foi enviada ao engenheiro de IA para implementação.
                </p>
            </div>
            
            <div className="bg-secondary dark:bg-dark-secondary p-4 rounded-lg mb-4">
                <p className="text-sm font-mono text-textPrimary dark:text-dark-textPrimary whitespace-pre-wrap">{command}</p>
            </div>

            <div className="bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 text-sm p-3 rounded-lg mb-6">
                <strong>Próximo Passo:</strong> Copie este comando e cole no seu próximo prompt para o assistente de IA para que as alterações sejam aplicadas no código.
            </div>

            <div className="flex items-center justify-center gap-4">
                 <Button onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Comando
                </Button>
                <Button variant="outline" onClick={resolveCommand}>
                    Enviar Outro Comando
                </Button>
            </div>
        </div>
    );
}
