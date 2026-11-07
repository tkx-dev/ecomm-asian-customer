// Cart API client. All cart requests go through this file (see AGENTS.md).
import type { CartSummary } from '#shared/types/catalog'

export async function addToCart(productId: string, quantity = 1): Promise<CartSummary> {
  if (import.meta.dev) {
    const { mockAddToCart } = await import('./mock/cart')
    return mockAddToCart(productId, quantity)
  }
  // [TODO: ask] Call the real endpoint once the cart API is documented. Do not guess it.
  throw new Error('The cart API is not connected yet.')
}
