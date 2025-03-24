import { FilterType } from '../types';

export const isDateInRange = (transactionDate: string, filter: FilterType): boolean => {
  const now = new Date();
  const date = new Date(transactionDate);

  switch (filter) {
    case 'day':
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    case 'week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return date >= startOfWeek;
    case 'month':
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    case 'year':
      return date.getFullYear() === now.getFullYear();
    default:
      return false;
  }
};

export const formatAmount = (amount: number): string => {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + ' tỷ';
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + ' triệu';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'k';
  }
  return amount.toString();
};