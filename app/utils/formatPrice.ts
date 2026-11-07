import type { Money } from '#shared/types/catalog'

/** Formats an API-provided amount for display only. Never use it for arithmetic. */
export function formatPrice(price: Money) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(
    price.amount,
  )
}
