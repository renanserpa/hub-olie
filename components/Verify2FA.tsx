import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { verifyTotpChallenge, getFactors } from '../services/authService';
import { trackLoginEvent } from '../services/analyticsService';

interface Verify2FAProps {
  amr: { method: string; timestamp: number }[];
  onVerified: () => void;
}

const Verify2FA: React.FC<Verify2FAProps> = ({ amr, onVerified }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newCode = code.split('');
      newCode[index] = value;
      setCode(newCode.join('').slice(0, 6));

      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
        const factorsData = await getFactors();
        const totpFactor = factorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');

        if (!totpFactor) {
            throw new Error("Fator TOTP não encontrado ou não verificado. Habilite o 2FA novamente.");
        }

        await verifyTotpChallenge(totpFactor.id, code);
        trackLoginEvent('2fa_success');
        toast({ title: 'Verificação bem-sucedida!', description: 'Você está sendo redirecionado.' });
        onVerified();
    } catch (err) {
        trackLoginEvent('2fa_failure', { metadata: { error: (err as Error).message } });
        setError('Código inválido ou expirado. Tente novamente.');
        toast({ title: 'Falha na Verificação', description: (err as Error).message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-xl p-8 text-center">
        <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Verificação em Duas Etapas</h1>
        <p className="text-textSecondary mt-2 mb-6">
          Insira o código de 6 dígitos do seu aplicativo autenticador.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={code[index] || ''}
                onChange={e => handleInputChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-2xl font-semibold border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <Button type="submit" disabled={isLoading || code.length !== 6} className="w-full h-11 text-base">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Verificar Código
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Verify2FA;
