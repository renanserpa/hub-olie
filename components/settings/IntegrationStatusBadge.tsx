import React from 'react';
import { IntegrationStatus } from '../../types';
import { cn } from '../../lib/utils';

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
}

const statusConfig: Record<IntegrationStatus, { label: string; className: string }> = {
    connected: { label: "Conectado", className: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 border-green-200" },
    disconnected: { label: "Desconectado", className: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
    error: { label: "Erro", className: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border-red-200" },
};

export function IntegrationStatusBadge({ status }: IntegrationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.disconnected;
  return (
    <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  );
}
