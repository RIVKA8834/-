import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₪${amount.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function parseVatField(value: string): boolean {
  const normalizedValue = value.trim().toLowerCase();
  const trueValues = ['כן', 'yes', 'true', '1', 'כולל', 'כולל מעמ'];
  return trueValues.includes(normalizedValue);
}

export function calculateVAT(
  unitPrice: number,
  quantity: number,
  priceIncludesVat: boolean,
  vatRate: number
): { subtotal: number; vat: number; total: number } {
  if (priceIncludesVat) {
    // המחיר כבר כולל מע"מ
    const total = unitPrice * quantity;
    const subtotal = total / (1 + vatRate);
    const vat = total - subtotal;
    return { subtotal, vat, total };
  } else {
    // המחיר לא כולל מע"מ
    const subtotal = unitPrice * quantity;
    const vat = subtotal * vatRate;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }
}
