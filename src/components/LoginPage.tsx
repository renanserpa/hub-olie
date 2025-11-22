
import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { supabase } from '../lib/supabaseClient';
import BootstrapModal from './BootstrapModal';

// Estilos simples para garantir renderização sem dependências de bibliotecas de UI
const styles = {
    container: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' },
    card: { width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    title: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827', textAlign: 'center' as const },
    subtitle: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' as const },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' },
    button: { width: '100%', padding: '0.75rem', backgroundColor: '#D2A66D', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
    secondaryButton: { width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', marginTop: '1rem', cursor: 'pointer', fontSize: '0.875rem' },
    statusBox: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '500' },
    statusSuccess: { backgroundColor: '#d1fae5', color: '#065f46' },
    statusError: { backgroundColor: '#fee2e2', color: '#991b1b' },
    statusInfo: { backgroundColor: '#e0f2fe', color: '#075985' },
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adm@adm.com');
  const [password, setPassword] = useState('111111');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'info' | 'success' | 'error'}>({ msg: 'Verificando conexão...', type: 'info' });
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

  useEffect(() => {
      // Teste de conexão imediato ao montar
      const testConnection = async () => {
          try {
              const { data, error } = await supabase.from('system_config').select('count', { count: 'exact', head: true });
              
              if (error) {
                  if (error.code === '42P01') { // Tabela não existe
                      setStatus({ msg: 'Banco de dados não configurado. Execute o script SQL.', type: 'error' });
                      setIsBootstrapOpen(true);
                  } else {
                      setStatus({ msg: `Erro de conexão: ${error.message}`, type: 'error' });
                  }
              } else {
                  setStatus({ msg: 'Conectado ao Supabase.', type: 'success' });
              }
          } catch (e: any) {
              setStatus({ msg: `Erro crítico: ${e.message}`, type: 'error' });
          }
      };
      testConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ msg: 'Autenticando...', type: 'info' });

    try {
      await login(email, password);
      setStatus({ msg: 'Login realizado! Redirecionando...', type: 'success' });
      // Pequeno delay para o usuário ver a mensagem
      setTimeout(() => {
          window.location.href = '/';
      }, 500);
    } catch (err: any) {
      console.error(err);
      setStatus({ msg: err.message || 'Falha no login.', type: 'error' });
      
      // Se o erro sugerir falta de tabelas, oferece o bootstrap
      if (err.message?.includes('relation') || err.message?.includes('not exist') || err.message?.includes('profiles')) {
          setIsBootstrapOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Olie Hub Ops</h1>
        <p style={styles.subtitle}>Modo de Acesso Seguro (v31)</p>

        <div style={{
            ...styles.statusBox,
            ...(status.type === 'success' ? styles.statusSuccess : status.type === 'error' ? styles.statusError : styles.statusInfo)
        }}>
            {status.msg}
        </div>

        <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={styles.input}
                required
              />
            </div>
            <button type="submit" disabled={isLoading} style={{...styles.button, opacity: isLoading ? 0.7 : 1}}>
              {isLoading ? 'Processando...' : 'Entrar'}
            </button>
        </form>

        <button 
            type="button" 
            onClick={() => setIsBootstrapOpen(true)} 
            style={styles.secondaryButton}
        >
            🛠️ Configurar Banco de Dados (SQL)
        </button>
      </div>

      <BootstrapModal isOpen={isBootstrapOpen} onClose={() => setIsBootstrapOpen(false)} />
    </div>
  );
};

export default LoginPage;
