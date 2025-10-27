import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Calculate VAT and totals
export function calculateTotals(
  unitPrice: number,
  quantity: number,
  priceIncludesVat: boolean,
  vatRate: number
): {
  subtotal: number
  vat: number
  total: number
} {
  if (priceIncludesVat) {
    // Price includes VAT, extract it
    const total = unitPrice * quantity
    const subtotal = total / (1 + vatRate)
    const vat = total - subtotal
    return { subtotal, vat, total }
  } else {
    // Price doesn't include VAT, add it
    const subtotal = unitPrice * quantity
    const vat = subtotal * vatRate
    const total = subtotal + vat
    return { subtotal, vat, total }
  }
}

// Normalize boolean from Excel/CSV
export function normalizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['כן', 'yes', 'true', '1', 'נכון'].includes(normalized)
  }
  return false
}

// Size helpers
export const SIZES = ['34', '36', '38', '40', '42'] as const
export type SizeName = (typeof SIZES)[number]

export function getTotalQuantity(quantities: Record<string, number>): number {
  return Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
}
