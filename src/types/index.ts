import { Product, Order, OrderItem, Settings } from '@prisma/client'

export type ProductWithSizes = Product & {
  sizes: { size: { name: string } }[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
}

export interface CartItem {
  productId: string
  sku: string
  name: string
  color: string
  unitPrice: number
  priceIncludesVat: boolean
  quantities: {
    '34': number
    '36': number
    '38': number
    '40': number
    '42': number
  }
}

export interface OrderFormData {
  retailerName: string
  vatNumber?: string
  contactName: string
  phone: string
  email: string
  shippingAddress: string
  notes?: string
  requestedDate?: Date
}

export interface ImportColumnMapping {
  sku: string
  name: string
  color: string
  unitPrice: string
  priceIncludesVat: string
  sizeSet?: string
}
