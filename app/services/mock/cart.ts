// Dev-only dummy cart. Never imported in production builds (see ../cart.ts).
import type { CartSummary } from '#shared/types/catalog'

let itemCount = 0

export async function mockAddToCart(_productId: string, quantity: number): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  itemCount += quantity
  return { itemCount }
}
