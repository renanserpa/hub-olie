import { useState } from 'react';

export function useProductionFilters() {
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: { start: null, end: null },
  });

  function updateFilter(key: string, value: any) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return { filters, updateFilter };
}