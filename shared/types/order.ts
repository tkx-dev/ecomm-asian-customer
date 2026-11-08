// Provisional order shapes used by the dev mock data.
// [TODO: ask] Match these to the real orders API once it is documented (see AGENTS.md).
import type { Money } from './catalog'

/** Every status the storefront must handle. The strings match the API exactly. */
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface OrderSummary {
  id: string
  /** Order number shown to the customer. */
  number: string
  /** ISO 8601 date-time. */
  placedAt: string
  itemCount: number
  /** Order total as sent by the API. Never recompute it on the frontend. */
  total: Money
  status: OrderStatus
  /** ISO 8601 deadline for paying a `pending_payment` order. Set by the API. */
  paymentDueAt?: string | null
}

/** Number of the customer's orders in each status, as counted by the API. */
export type OrderCounts = Partial<Record<OrderStatus, number>>
