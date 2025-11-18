import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Spinner } from '../ui/Spinner';
import Verify2FA from '../Verify2FA';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading, mfaChallenge, setMfaChallenge } = useApp();

    if (isLoading) {
        return <Spinner />;
    }

    // Se não há usuário autenticado, redireciona para a rota pública de login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se há um desafio de MFA pendente (mesmo com user existe), exibe a tela de verificação
    // Isso age como uma barreira secundária de proteção
    if (mfaChallenge) {
        return (
            <Verify2FA 
                amr={mfaChallenge.amr} 
                onVerified={() => setMfaChallenge(null)} 
            />
        );
    }

    // Se autenticado e sem pendências de segurança, renderiza o conteúdo protegido (Layout/Páginas)
    return <>{children}</>;
};