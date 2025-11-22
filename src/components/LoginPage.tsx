
import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { supabase } from '../lib/supabaseClient';
import { Loader2, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import BootstrapModal from './BootstrapModal';

// Estilos inline para garantir que carregue mesmo se o Tailwind falhar
const containerStyle = {
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif'
};
const cardStyle = {
    width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'neutral' | 'success' | 'error'}>({ msg: 'Pronto', type: 'neutral' });
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

  // Teste de conexão ao montar
  useEffect(() => {
      const checkConnection = async () => {
          const { error } = await supabase.from('system_config').select('count', { count: 'exact', head: true });
          if (error && error.code === '42P01') {
              setStatus({ msg: 'Tabelas não encontradas. Execute o Bootstrap.', type: 'error' });
              setIsBootstrapOpen(true); // Abre automaticamente se faltar tabela
          } else if (error) {
               setStatus({ msg: `Erro de conexão: ${error.message}`, type: 'error' });
          } else {
              setStatus({ msg: 'Conectado ao Supabase.', type: 'success' });
          }
      };
      checkConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ msg: 'Autenticando...', type: 'neutral' });
    
    try {
      await login(email, password);
      setStatus({ msg: 'Sucesso! Redirecionando...', type: 'success' });
      // Forçar recarregamento limpo
      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      setStatus({ msg: err.message || 'Erro ao entrar', type: 'error' });
      
      if (err.message?.includes('profiles') || err.message?.includes('relation')) {
           setIsBootstrapOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#111827'}}>Olie Hub Ops</h1>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Acesso Administrativo</p>
        </div>

        <div style={{marginBottom: '20px', padding: '10px', borderRadius: '6px', backgroundColor: status.type === 'error' ? '#fee2e2' : status.type === 'success' ? '#dcfce7' : '#f3f4f6', color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#374151', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            {status.type === 'error' ? <AlertTriangle size={16}/> : status.type === 'success' ? <CheckCircle size={16}/> : <Database size={16}/>}
            {status.msg}
        </div>

        <form onSubmit={handleLogin}>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px'}}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none'}}
              />
            </div>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px'}}>Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none'}}
              />
            </div>
            <button 
                type="submit" 
                disabled={isLoading}
                style={{width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#D2A66D', color: 'white', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}
            >
              {isLoading ? 'Carregando...' : 'Entrar no Sistema'}
            </button>
        </form>

        <button 
            type="button"
            onClick={() => setIsBootstrapOpen(true)}
            style={{marginTop: '15px', width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'transparent', color: '#6b7280', fontSize: '12px', cursor: 'pointer'}}
        >
            🛠️ Configurar Banco de Dados (Script SQL)
        </button>
      </div>
      
      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </div>
  );
};

export default LoginPage;
