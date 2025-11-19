import React from 'react';
import Dashboard from '../modules/Dashboard';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { LogOut } from 'lucide-react';
import { logout } from '../services/authService';

const DashboardPage: React.FC = () => {
    const { user } = useApp();

    const handleLogout = async () => {
        try {
            await logout(); 
            // O redirecionamento será tratado automaticamente pelo AppContext/ProtectedRoute
            // quando o estado 'user' se tornar nulo.
        } catch (error) {
            console.error('Erro ao sair', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Seção de Boas-vindas opcional dentro do conteúdo */}
            <div className="flex justify-between items-end mb-4 p-4 bg-card dark:bg-dark-card rounded-lg border border-border dark:border-dark-border">
                <div>
                    <h2 className="text-lg font-semibold text-textPrimary dark:text-dark-textPrimary">
                        Bem-vindo ao Olie Hub, {user?.email.split('@')[0]}!
                    </h2>
                    <p className="text-sm text-textSecondary dark:text-dark-textSecondary">
                        Aqui está o resumo das operações de hoje.
                    </p>
                </div>
                 <Button variant="outline" size="sm" onClick={handleLogout} className="md:hidden">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                </Button>
            </div>
            
            <Dashboard />
        </div>
    );
};

export default DashboardPage;