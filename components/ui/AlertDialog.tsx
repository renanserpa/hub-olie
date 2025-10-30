import React, { ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './Card';
import { Button } from './Button';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ isOpen, onClose, onConfirm, title, description }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center animate-content-show"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-sm m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-textSecondary dark:text-dark-textSecondary">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
                Cancelar
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
                Confirmar
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AlertDialog;