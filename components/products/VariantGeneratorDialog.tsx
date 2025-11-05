import React from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import PlaceholderContent from '../PlaceholderContent';
import { Wrench } from 'lucide-react';

interface VariantGeneratorDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const VariantGeneratorDialog: React.FC<VariantGeneratorDialogProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gerador de Variantes">
            <PlaceholderContent title="Gerador em Desenvolvimento" requiredTable="" icon={Wrench}>
                <p className="mt-1 text-sm text-textSecondary">
                    A ferramenta para selecionar e gerar todas as combinações de variantes em massa estará disponível aqui em breve.
                </p>
            </PlaceholderContent>
             <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
            </div>
        </Modal>
    );
};

export default VariantGeneratorDialog;