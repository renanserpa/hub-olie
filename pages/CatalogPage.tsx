// This page's content has been moved to the "Produtos" module under the "Dados Mestres" tab.
// This file can be safely deleted in a future cleanup.
import React from 'react';
import { BookOpen } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';

const DeprecatedCatalogPage: React.FC = () => {
    const { setActiveModule } = useApp();

    return (
        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h1 className="mt-4 text-xl font-bold text-textPrimary">Página de Catálogo Movida</h1>
            <p className="mt-1 text-sm text-textSecondary max-w-md mx-auto">
                Para melhorar a organização, toda a gestão de dados mestres de personalização e materiais foi centralizada dentro do módulo de Produtos.
            </p>
            <Button className="mt-6" onClick={() => setActiveModule('products')}>
                Ir para o Módulo de Produtos
            </Button>
        </div>
    );
};

export default DeprecatedCatalogPage;