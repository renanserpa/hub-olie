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

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se houver um desafio MFA pendente, exibe a tela de verificação em vez do conteúdo protegido
    if (mfaChallenge) {
        return (
            <Verify2FA 
                amr={mfaChallenge.amr} 
                onVerified={() => setMfaChallenge(null)} 
            />
        );
    }

    return <>{children}</>;
};
