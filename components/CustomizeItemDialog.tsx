
import React, { useState } from 'react';
import { ConfigJson } from '../types';
import Modal from './ui/Modal';
import { Button } from './ui/Button';

interface CustomizeItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConfigJson) => void;
  initialConfig: ConfigJson;
}

const COLOR_OPTIONS = ['#F4C2C2', '#92A8D1', '#FFD700', '#C0C0C0', '#F5F5DC', '#000000', '#FFFFFF', '#E0BFB8'];

const CustomizeItemDialog: React.FC<CustomizeItemDialogProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
    const [config, setConfig] = useState<ConfigJson>(initialConfig);

    const handleChange = (field: keyof ConfigJson, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(config);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Personalizar Item">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-textSecondary">Cor</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map(color => (
                            <button key={color} type="button" onClick={() => handleChange('color', color)}
                                className={`w-8 h-8 rounded-full border-2 ${config.color === color ? 'border-primary ring-2 ring-primary/50' : 'border-border'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="text" className="block text-sm font-medium text-textSecondary">Texto Personalizado</label>
                    <input id="text" type="text" value={config.text || ''} onChange={e => handleChange('text', e.target.value)} maxLength={50} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                 <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="width" className="block text-sm font-medium text-textSecondary">Largura (cm)</label>
                        <input id="width" type="number" value={config.width || ''} onChange={e => handleChange('width', parseFloat(e.target.value))} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                     <div>
                        <label htmlFor="height" className="block text-sm font-medium text-textSecondary">Altura (cm)</label>
                        <input id="height" type="number" value={config.height || ''} onChange={e => handleChange('height', parseFloat(e.target.value))} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                     <div>
                        <label htmlFor="thickness" className="block text-sm font-medium text-textSecondary">Espessura (cm)</label>
                        <input id="thickness" type="number" value={config.thickness || ''} onChange={e => handleChange('thickness', parseFloat(e.target.value))} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-textSecondary">Observações do Item</label>
                    <textarea id="notes" value={config.notes || ''} onChange={e => handleChange('notes', e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
            </div>
             <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Personalização</Button>
            </div>
        </Modal>
    );
};

export default CustomizeItemDialog;
