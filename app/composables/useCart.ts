import { addToCart } from '~/services/cart'

/** Cart badge state. The item count always comes from the cart API response. */
export function useCart() {
  const itemCount = useState<number>('cart-item-count', () => 0)
  const pendingProductId = useState<string | null>('cart-pending-product', () => null)

  async function add(productId: string, quantity = 1) {
    pendingProductId.value = productId
    try {
      const cart = await addToCart(productId, quantity)
      itemCount.value = cart.itemCount
    } finally {
      pendingProductId.value = null
    }
  }

  return { itemCount: readonly(itemCount), pendingProductId: readonly(pendingProductId), add }
}
