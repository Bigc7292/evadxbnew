import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'AED'): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDualPrice(price: number, fromCurrency = 'USD'): string {
  const usd = formatPrice(price, 'USD');
  const converted = convertToAed(price, fromCurrency);
  return `${usd} / ${formatPrice(converted, 'AED')}`;
}

const USD_TO_AED = 3.6725;

export function convertToAed(amount: number, currency = 'USD'): number {
  if (currency === 'AED') return amount;
  if (currency === 'USD') return amount * USD_TO_AED;
  return amount;
}

export function normalizePropertyPrice(price: number | null, currency = 'USD'): number | null {
  if (price == null || isNaN(price)) return null;
  if (price <= 0) return null;
  const upper = currency.toUpperCase();
  if (upper === 'AED' && price < 100_000 && price > 0) {
    return Math.round(price * 1_000);
  }
  if (upper === 'USD' && price < 100 && price > 0) {
    return Math.round(price * 1_000);
  }
  return price;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-AE').format(num);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}