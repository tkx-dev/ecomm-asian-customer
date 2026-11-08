<script setup lang="ts">
import { getProductPage, type MockScenario } from '~/services/catalog'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

// Dev only: preview page states with ?mock=loading | error | empty (empty = product not found)
const scenario = computed<MockScenario>(() => {
  const value = route.query.mock
  return import.meta.dev && (value === 'loading' || value === 'error' || value === 'empty')
    ? value
    : 'ok'
})

const { data, status, error, refresh } = await useAsyncData(
  () => `product-${slug.value}`,
  () => getProductPage(slug.value, scenario.value),
  { lazy: true, server: scenario.value === 'ok', watch: [scenario] },
)

const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')
const product = computed(() => data.value?.product)
const notFound = computed(() => status.value === 'success' && data.value === null)

// Stock wording only. Whether the order can be filled is the API's call.
const stockLabel = computed(() => {
  const p = product.value
  if (!p) return null
  if (!p.inStock) return { text: 'Out of stock', tone: 'bg-muted text-muted-foreground' }
  if (p.stock <= 10)
    return { text: `Only ${p.stock} left`, tone: 'bg-warning text-warning-foreground' }
  return { text: 'In stock', tone: 'bg-success text-success-foreground' }
})

const delivery = computed(() => {
  const p = product.value
  if (!p) return []
  return [
    { icon: 'truck', label: 'Delivery', value: p.shippingNote },
    { icon: 'shield-check', label: 'Warranty', value: p.warranty },
    { icon: 'wallet', label: 'Payment', value: 'Pay with cryptocurrency at checkout' },
  ].filter((row) => row.value) as {
    icon: 'truck' | 'shield-check' | 'wallet'
    label: string
    value: string
  }[]
})

const quantity = ref(1)
watch(slug, () => {
  quantity.value = 1
  notice.value = ''
  actionError.value = ''
})

const { add } = useCart()
const action = ref<'cart' | 'buy' | null>(null)
const actionError = ref('')
const notice = ref('')

async function addItem(mode: 'cart' | 'buy') {
  const p = product.value
  if (!p || action.value) return
  action.value = mode
  actionError.value = ''
  notice.value = ''
  try {
    await add(p.id, quantity.value)
    if (mode === 'buy') await navigateTo('/cart')
    else notice.value = `Added ${quantity.value} to your cart`
  } catch {
    actionError.value = 'Not added to cart. Try again.'
  } finally {
    action.value = null
  }
}

useSeoMeta({
  title: () => (product.value ? `${product.value.name} | InfinityShop` : 'Product | InfinityShop'),
  description: () => product.value?.description,
  ogImage: () => product.value?.images[0],
  robots: () => (notFound.value ? 'noindex' : undefined),
})

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
// White panel per block on mobile (app style). Plain on desktop.
const panel = 'bg-card px-4 py-5 sm:px-6 lg:bg-transparent lg:p-0'
const primaryButton =
  'inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70'
const secondaryButton =
  'inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary px-6 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70'
</script>

<template>
  <div class="bg-muted lg:bg-transparent dark:bg-background">
    <!-- Error -->
    <section
      v-if="status === 'error'"
      :class="[container, 'bg-background py-20']"
      aria-live="polite"
    >
      <div class="mx-auto max-w-md text-center">
        <h1 class="text-2xl font-semibold">This product could not be loaded</h1>
        <p class="mt-2 text-muted-foreground">
          {{ error?.message || 'The store did not respond.' }} Check your connection and try again.
        </p>
        <button
          type="button"
          class="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          @click="() => refresh()"
        >
          <AppIcon name="refresh" :size="18" />
          Try again
        </button>
      </div>
    </section>

    <!-- Not found (empty) -->
    <section v-else-if="notFound" :class="[container, 'bg-background py-20']">
      <div class="mx-auto max-w-md text-center">
        <AppIcon name="package" :size="40" class="mx-auto text-muted-foreground" />
        <h1 class="mt-4 text-2xl font-semibold">Product not found</h1>
        <p class="mt-2 text-muted-foreground">
          This product is no longer listed, or the link has a typo.
        </p>
        <NuxtLink
          to="/products"
          class="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Browse products
        </NuxtLink>
      </div>
    </section>

    <!-- Loading and success share one layout so nothing shifts -->
    <template v-else>
      <div :class="[container, 'max-lg:px-0 lg:py-8']" :aria-busy="isLoading">
        <nav aria-label="Breadcrumb" class="mb-6 hidden lg:block">
          <ol class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <NuxtLink
                to="/"
                class="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                Home
              </NuxtLink>
            </li>
            <template v-if="product">
              <li aria-hidden="true"><AppIcon name="chevron-right" :size="14" /></li>
              <li>
                <NuxtLink
                  :to="{ path: '/products', query: { category: product.category.slug } }"
                  class="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {{ product.category.name }}
                </NuxtLink>
              </li>
              <li aria-hidden="true"><AppIcon name="chevron-right" :size="14" /></li>
              <li aria-current="page" class="truncate text-foreground">{{ product.name }}</li>
            </template>
          </ol>
        </nav>

        <div class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <!-- Gallery -->
          <div class="bg-card pb-4 lg:sticky lg:top-24 lg:bg-transparent lg:pb-0">
            <div
              v-if="isLoading"
              class="aspect-square bg-muted motion-safe:animate-pulse lg:rounded-xl"
            />
            <ProductGallery
              v-else-if="product"
              :images="product.images"
              :name="product.name"
              :dimmed="!product.inStock"
            />
          </div>

          <div class="space-y-2 lg:space-y-8">
            <!-- Title, price, quantity, actions -->
            <section :class="panel" aria-labelledby="product-title">
              <template v-if="isLoading">
                <div class="h-4 w-24 rounded bg-muted motion-safe:animate-pulse" />
                <div class="mt-3 h-8 w-4/5 rounded bg-muted motion-safe:animate-pulse" />
                <div class="mt-5 h-9 w-32 rounded bg-muted motion-safe:animate-pulse" />
                <h1 id="product-title" class="sr-only">Loading product</h1>
              </template>
              <template v-else-if="product">
                <p v-if="product.brand" class="text-sm text-muted-foreground">
                  {{ product.brand }}
                </p>
                <h1
                  id="product-title"
                  class="mt-1 text-xl leading-snug font-semibold tracking-tight text-balance lg:text-3xl"
                >
                  {{ product.name }}
                </h1>
                <div class="mt-4 flex flex-wrap items-center gap-3">
                  <p class="text-3xl font-semibold text-primary tabular-nums">
                    {{ formatPrice(product.price) }}
                  </p>
                  <span
                    v-if="stockLabel"
                    :class="['rounded-full px-2.5 py-0.5 text-xs font-semibold', stockLabel.tone]"
                  >
                    {{ stockLabel.text }}
                  </span>
                </div>

                <div v-if="product.inStock" class="mt-6 flex flex-wrap items-center gap-4">
                  <label for="product-quantity" class="text-sm font-medium">Quantity</label>
                  <ProductQuantity
                    id="product-quantity"
                    v-model="quantity"
                    :max="product.stock"
                    :disabled="!!action"
                  />
                </div>

                <!-- Desktop actions. Mobile uses the bar pinned to the bottom. -->
                <div class="mt-6 hidden max-w-md gap-3 lg:flex">
                  <template v-if="product.inStock">
                    <button
                      type="button"
                      :class="secondaryButton"
                      :disabled="!!action"
                      @click="addItem('cart')"
                    >
                      <AppIcon
                        :name="action === 'cart' ? 'spinner' : 'cart-plus'"
                        :size="18"
                        :class="action === 'cart' && 'animate-spin motion-reduce:animate-none'"
                      />
                      {{ action === 'cart' ? 'Adding' : 'Add to cart' }}
                    </button>
                    <button
                      type="button"
                      :class="primaryButton"
                      :disabled="!!action"
                      @click="addItem('buy')"
                    >
                      <AppIcon
                        v-if="action === 'buy'"
                        name="spinner"
                        :size="18"
                        class="animate-spin motion-reduce:animate-none"
                      />
                      Buy now
                    </button>
                  </template>
                  <button
                    v-else
                    type="button"
                    disabled
                    :class="[secondaryButton, 'cursor-not-allowed']"
                  >
                    Out of stock
                  </button>
                </div>

                <p
                  role="status"
                  class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-success empty:hidden"
                >
                  <template v-if="notice">
                    <AppIcon name="check" :size="16" />
                    {{ notice }}.
                    <NuxtLink to="/cart" class="text-primary underline-offset-4 hover:underline">
                      View cart
                    </NuxtLink>
                  </template>
                </p>
                <p v-if="actionError" role="alert" class="mt-3 text-sm text-destructive">
                  {{ actionError }}
                </p>
              </template>
            </section>

            <!-- Delivery and payment -->
            <section
              :class="[panel, 'lg:rounded-xl lg:border lg:px-5 lg:py-2']"
              aria-label="Delivery and payment"
            >
              <ul v-if="isLoading" class="space-y-4 lg:py-3" aria-hidden="true">
                <li
                  v-for="n in 3"
                  :key="n"
                  class="h-10 rounded bg-muted motion-safe:animate-pulse"
                />
              </ul>
              <dl v-else class="divide-y">
                <div
                  v-for="row in delivery"
                  :key="row.label"
                  class="flex items-center gap-4 py-3 first:pt-0 last:pb-0 lg:first:pt-3 lg:last:pb-3"
                >
                  <AppIcon :name="row.icon" class="text-primary" />
                  <dt class="w-20 shrink-0 text-sm text-muted-foreground">{{ row.label }}</dt>
                  <dd class="text-sm font-medium">{{ row.value }}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        <!-- Description and specifications -->
        <div
          v-if="product || isLoading"
          class="mt-2 grid gap-2 lg:mt-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12"
        >
          <section :class="panel" aria-labelledby="about-title">
            <h2 id="about-title" class="text-lg font-semibold tracking-tight lg:text-2xl">
              About this product
            </h2>
            <div v-if="isLoading" class="mt-4 space-y-2" aria-hidden="true">
              <div class="h-4 rounded bg-muted motion-safe:animate-pulse" />
              <div class="h-4 w-5/6 rounded bg-muted motion-safe:animate-pulse" />
            </div>
            <p
              v-else
              class="mt-3 max-w-prose leading-relaxed whitespace-pre-line text-muted-foreground"
            >
              {{ product?.description }}
            </p>
          </section>

          <section :class="panel" aria-labelledby="specs-title">
            <h2 id="specs-title" class="text-lg font-semibold tracking-tight lg:text-2xl">
              Specifications
            </h2>
            <div v-if="isLoading" class="mt-4 h-40 rounded-xl bg-muted motion-safe:animate-pulse" />
            <dl v-else class="mt-3 divide-y rounded-xl border text-sm">
              <div
                v-for="spec in product?.specs"
                :key="spec.label"
                class="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3"
              >
                <dt class="text-muted-foreground">{{ spec.label }}</dt>
                <dd class="font-medium break-words">{{ spec.value }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <!-- Related -->
        <section
          v-if="isLoading || data?.related.length"
          :class="[panel, 'mt-2 lg:mt-16']"
          aria-labelledby="related-title"
        >
          <h2 id="related-title" class="text-lg font-semibold tracking-tight lg:text-2xl">
            You may also like
          </h2>
          <ProductGrid class="mt-6" :products="data?.related" :loading="isLoading" />
        </section>
      </div>

      <!-- Mobile action bar, pinned to the bottom while the product is on screen -->
      <div
        v-if="product"
        class="sticky bottom-0 z-30 mt-2 border-t bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
      >
        <div v-if="product.inStock" class="flex gap-3">
          <button
            type="button"
            :class="secondaryButton"
            :disabled="!!action"
            @click="addItem('cart')"
          >
            <AppIcon
              :name="action === 'cart' ? 'spinner' : 'cart-plus'"
              :size="18"
              :class="action === 'cart' && 'animate-spin motion-reduce:animate-none'"
            />
            {{ action === 'cart' ? 'Adding' : 'Add to cart' }}
          </button>
          <button type="button" :class="primaryButton" :disabled="!!action" @click="addItem('buy')">
            <AppIcon
              v-if="action === 'buy'"
              name="spinner"
              :size="18"
              class="animate-spin motion-reduce:animate-none"
            />
            Buy now
          </button>
        </div>
        <button
          v-else
          type="button"
          disabled
          :class="[secondaryButton, 'w-full cursor-not-allowed']"
        >
          Out of stock
        </button>
      </div>
    </template>
  </div>
</template>
