import React from 'react';
import { cn } from '../lib/utils';

interface PasswordStrengthMeterProps {
  password?: string;
}

const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '' };

  if (password.length >= 8) score++;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^A-Za-z0-9]/)) score++;

  switch (score) {
    case 0:
    case 1:
      return { score, label: 'Muito Fraca', color: 'bg-red-500' };
    case 2:
      return { score, label: 'Fraca', color: 'bg-orange-500' };
    case 3:
      return { score, label: 'Média', color: 'bg-yellow-500' };
    case 4:
      return { score, label: 'Forte', color: 'bg-blue-500' };
    case 5:
      return { score, label: 'Muito Forte', color: 'bg-green-500' };
    default:
      return { score: 0, label: '', color: '' };
  }
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const { score, label, color } = checkPasswordStrength(password);

  return (
    <div>
      <div className="flex gap-2 h-1.5 rounded-full overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn('flex-1', i < score ? color : 'bg-gray-200 dark:bg-gray-600')}></div>
        ))}
      </div>
      {password && <p className="text-xs mt-1 text-right font-medium">{label}</p>}
    </div>
  );
};

export default PasswordStrengthMeter;
