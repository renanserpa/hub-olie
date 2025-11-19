import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { LogOut, User } from 'lucide-react';

export function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simples */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Olie Hub</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <span className="hidden md:inline-block">{user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900">Bem-vindo ao Olie Hub!</h2>
          <p className="mt-2 text-gray-600">
            Você está logado como <span className="font-medium text-gray-900">{user?.email}</span>.
          </p>
          
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Placeholders para futuros widgets */}
            <div className="rounded-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">Pedidos Recentes</h3>
              <p className="mt-2 text-sm text-gray-500">Nenhum pedido recente encontrado.</p>
            </div>
            <div className="rounded-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">Produtos</h3>
              <p className="mt-2 text-sm text-gray-500">Gerencie seu catálogo de produtos.</p>
            </div>
            <div className="rounded-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">Configurações</h3>
              <p className="mt-2 text-sm text-gray-500">Ajuste as preferências do sistema.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}