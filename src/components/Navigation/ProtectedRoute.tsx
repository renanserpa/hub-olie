import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useApp();

    // 1. Prioridade Máxima: Mostrar Spinner enquanto o Supabase consulta a sessão.
    // Isso evita que o redirecionamento ocorra antes que saibamos o estado do usuário.
    if (isLoading) {
        return <Spinner />;
    }

    // 2. Se o carregamento terminou e NÃO HÁ usuário, redirecione para o login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Se houver usuário, renderize o conteúdo protegido.
    // Nota: A verificação de MFA foi removida temporariamente para isolar problemas de login.
    return <>{children}</>;
};
