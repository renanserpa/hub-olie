import React from 'react';
import { IntegrationLog } from '../../types';
import Modal from '../ui/Modal';

interface IntegrationLogsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    logs: IntegrationLog[];
    integrationName: string;
}

export function IntegrationLogsDialog({ isOpen, onClose, logs, integrationName }: IntegrationLogsDialogProps) {
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-BR');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Logs para: ${integrationName}`}>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {logs.length > 0 ? (
                    <ul className="space-y-3 text-sm">
                        {logs.map(log => (
                            <li key={log.id} className="border-l-2 pl-3">
                                <p className="font-semibold">{log.event}</p>
                                <p className="text-xs text-textSecondary">{log.message}</p>
                                <p className="text-xs text-textSecondary/70 mt-1">{formatDate(log.created_at)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-textSecondary text-center py-8">Nenhum log encontrado para esta integração.</p>
                )}
            </div>
        </Modal>
    );
}
