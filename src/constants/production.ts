export const PRODUCTION_PRIORITY_META = {
  LOW: {
    label: 'Baixa',
    className: 'bg-gray-100 text-gray-700',
  },
  MEDIUM: {
    label: 'Média',
    className: 'bg-yellow-100 text-yellow-700',
  },
  HIGH: {
    label: 'Alta',
    className: 'bg-red-100 text-red-700',
  },
} as const;

export const getPriorityMeta = (priority?: number | null) => {
  if (priority === null || priority === undefined) return null;
  if (priority >= 2) return PRODUCTION_PRIORITY_META.HIGH;
  if (priority >= 1) return PRODUCTION_PRIORITY_META.MEDIUM;
  return PRODUCTION_PRIORITY_META.LOW;
};
