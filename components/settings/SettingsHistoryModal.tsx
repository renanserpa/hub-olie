import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { useGovernance } from '../../hooks/useGovernance';
import { SystemSettingsHistory } from '../../types';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface SettingsHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    settingKey: string;
    onRevertSuccess: () => void;
}

const SettingsHistoryModal: React.FC<SettingsHistoryModalProps> = ({ isOpen, onClose, settingKey, onRevertSuccess }) => {
    const { history, fetchHistory, revertToVersion } = useGovernance();
    const [isLoading, setIsLoading] = useState(true);
    const [revertingId, setRevertingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetchHistory(settingKey).finally(() => setIsLoading(false));
        }
    }, [isOpen, settingKey, fetchHistory]);
    
    const handleRevert = async (id: string) => {
        setRevertingId(id);
        await revertToVersion(id);
        setRevertingId(null);
        onRevertSuccess();
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-BR');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Histórico de Alterações: ${settingKey}`}>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Loader2 className="w-6 h-6 animate-spin"/></div>
                ) : history.length > 0 ? (
                    history.map(item => (
                        <div key={item.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-textSecondary">{formatDate(item.created_at)}</p>
                                    <p className="text-sm font-medium">Alterado por: <span className="font-semibold text-primary">{item.changed_by}</span></p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleRevert(item.id)} disabled={!!revertingId}>
                                    {revertingId === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <RotateCcw className="w-4 h-4 mr-2"/>}
                                    Reverter
                                </Button>
                            </div>
                            <pre className="mt-2 p-2 bg-secondary rounded text-xs whitespace-pre-wrap font-mono max-h-32 overflow-auto">
                                {item.new_value}
                            </pre>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-textSecondary py-8">Nenhum histórico encontrado para este parâmetro.</p>
                )}
            </div>
        </Modal>
    );
};

export default SettingsHistoryModal;