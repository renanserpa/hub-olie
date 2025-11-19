import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useApp();

    // 1. Prioridade Máxima: Mostrar Spinner enquanto o Supabase consulta a sessão.
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-secondary dark:bg-dark-secondary">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
        );
    }

    // 2. Se o carregamento terminou e NÃO HÁ usuário, redirecione para o login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Se houver usuário, renderize o conteúdo.
    return <>{children}</>;
};
