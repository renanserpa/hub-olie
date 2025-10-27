import React, { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { IconButton } from './IconButton';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center animate-content-show"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <IconButton onClick={onClose} className="h-6 w-6">
             <X size={20} />
          </IconButton>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default Modal;