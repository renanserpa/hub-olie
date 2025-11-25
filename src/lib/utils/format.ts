export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('pt-BR');
};

export const isValidEmail = (value: string): boolean => {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  const atIndex = normalized.indexOf('@');
  const dotIndex = normalized.lastIndexOf('.');
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < normalized.length - 1;
};

export const normalizePhoneDigits = (value: string): string => value.replace(/\D/g, '');

export const formatPhoneNumber = (value: string): string => {
  const digits = normalizePhoneDigits(value);
  if (!digits) return '';

  const area = digits.slice(0, 2);
  const hasNineDigitLocal = digits.length > 10;
  const middle = hasNineDigitLocal ? digits.slice(2, 7) : digits.slice(2, 6);
  const end = hasNineDigitLocal ? digits.slice(7, 11) : digits.slice(6, 10);

  if (!middle) return `(${area}`.trim();
  if (!end) return `(${area}) ${middle}`.trim();
  return `(${area}) ${middle}-${end}`.trim();
};
