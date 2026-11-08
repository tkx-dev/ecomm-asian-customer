import type { OrderStatus } from '#shared/types/order'

/** Customer-facing name for each API order status. */
export const orderStatusLabel: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

/** Badge colors per status. Semantic tokens only (see AGENTS.md). */
export const orderStatusTone: Record<OrderStatus, string> = {
  pending_payment: 'bg-warning text-warning-foreground',
  paid: 'bg-secondary text-secondary-foreground',
  processing: 'bg-secondary text-secondary-foreground',
  shipped: 'bg-accent text-accent-foreground',
  delivered: 'bg-accent text-accent-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
  refunded: 'bg-muted text-muted-foreground',
}
