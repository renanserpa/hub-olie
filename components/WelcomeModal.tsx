import React from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { UserProfile } from '../types';
import { PartyPopper } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: () => void;
  user: UserProfile;
}

const MODULE_NAMES: Record<string, string> = {
    dashboard: 'Painel Principal',
    production: 'Produção',
    orders: 'Pedidos',
    analytics: 'Analytics',
    logistics: 'Logística',
    marketing: 'Marketing',
};

const DEFAULT_PAGE_BY_ROLE: Record<string, string> = {
    AdminGeral: 'dashboard',
    Producao: 'production',
    Vendas: 'orders',
    Financeiro: 'analytics',
    Administrativo: 'logistics',
    Conteudo: 'marketing',
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onComplete, user }) => {
  if (!user) return null;

  const userRoleName = user.role.replace('AdminGeral', 'Admin Geral');
  const targetModuleId = DEFAULT_PAGE_BY_ROLE[user.role] || 'dashboard';
  const targetModuleName = MODULE_NAMES[targetModuleId] || 'Painel';

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Bem-vindo(a) ao Olie Hub!">
        <div className="text-center">
            <PartyPopper className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Olá, {user.email.split('@')[0]}!</h3>
            <p className="text-sm text-textSecondary mt-2">
                Seu primeiro acesso foi registrado com sucesso.
            </p>
            <div className="my-4 p-3 bg-secondary rounded-lg">
                <p className="text-xs text-textSecondary">Sua função no sistema é:</p>
                <p className="font-semibold text-primary">{userRoleName}</p>
            </div>
            <p className="text-sm text-textSecondary">
                Para facilitar seu trabalho, vamos te direcionar para o módulo de <strong>{targetModuleName}</strong>.
            </p>
            <Button onClick={onComplete} className="mt-6 w-full">
                Começar a usar o Olie Hub
            </Button>
        </div>
    </Modal>
  );
};

export default WelcomeModal;