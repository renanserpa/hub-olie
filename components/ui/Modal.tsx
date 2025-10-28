import React, { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { IconButton } from './IconButton';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center animate-fade-in-up"
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
    >
      <Card 
        className={cn("w-full max-w-md m-4 flex flex-col", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle>{title}</CardTitle>
          <IconButton onClick={onClose} className="h-6 w-6">
             <X size={20} />
          </IconButton>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default Modal;
