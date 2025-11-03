import React from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

// This is a placeholder component as per the prompt.
// The full implementation would require more state management.

interface ProductionTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    taskName: string;
}

const ProductionTaskDialog: React.FC<ProductionTaskDialogProps> = ({ isOpen, onClose, taskName }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Apontamento: ${taskName}`}>
            <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-lg">
                🚧 O diálogo para registrar início, pausa e conclusão de tarefas com cálculo de tempo está em desenvolvimento.
            </div>
            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>Fechar</Button>
            </div>
        </Modal>
    );
};

export default ProductionTaskDialog;