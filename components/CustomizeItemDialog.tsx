

import React from 'react';
import { ConfigJson, Product, AppData } from '../types';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import PlaceholderContent from './PlaceholderContent';
import { Wrench } from 'lucide-react';


interface CustomizeItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConfigJson) => void;
  initialConfig: ConfigJson;
  product: Product;
  appData: AppData;
}

const CustomizeItemDialog: React.FC<CustomizeItemDialogProps> = ({ isOpen, onClose, onSave, initialConfig, product, appData }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Personalizar: ${product.name}`}>
            <PlaceholderContent title="Configurador em Manutenção" requiredTable="" icon={Wrench}>
                <p className="mt-1 text-sm text-textSecondary">O configurador de produtos está sendo atualizado para a nova arquitetura de variantes. Esta funcionalidade será reativada na Fase 2.</p>
            </PlaceholderContent>
             <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
            </div>
        </Modal>
    );
};

export default CustomizeItemDialog;