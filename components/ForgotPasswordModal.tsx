import React, { useState } from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Loader2, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from '../services/authService';
import { toast } from '../hooks/use-toast';
import { analyticsService } from '../services/analyticsService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
      analyticsService.trackEvent('password_reset_request', { email });
      setIsSent(true);
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      onClose();
      // Reset state after a short delay to allow modal to close
      setTimeout(() => {
          setEmail('');
          setIsSent(false);
      }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Recuperar Senha">
      <div aria-live="polite">
        {isSent ? (
            <div className="text-center">
                <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Verifique seu E-mail</h3>
                <p className="text-sm text-textSecondary mt-2">
                    Se uma conta com o e-mail <strong>{email}</strong> existir, um link de redefinição de senha foi enviado.
                </p>
                <Button onClick={handleClose} className="mt-4">Fechar</Button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-textSecondary">
                    Insira o endereço de e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
                </p>
                <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-textSecondary mb-1">Email</label>
                    <input
                        type="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-required="true"
                        aria-label="Endereço de e-mail para recuperação"
                        placeholder="seu@email.com"
                        className="w-full px-4 py-2 bg-white dark:bg-dark-secondary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-textPrimary dark:text-dark-textPrimary"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading || !email}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Link
                    </Button>
                </div>
            </form>
        )}
        </div>
    </Modal>
  );
};

export default ForgotPasswordModal;