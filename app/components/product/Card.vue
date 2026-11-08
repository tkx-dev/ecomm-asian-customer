<script setup lang="ts">
import type { Product } from '#shared/types/catalog'

const props = defineProps<{ product: Product }>()

const { add, pendingProductId } = useCart()
const addError = ref('')
const isAdding = computed(() => pendingProductId.value === props.product.id)
const productUrl = computed(() => `/products/${props.product.slug}`)

async function addToCart() {
  addError.value = ''
  try {
    await add(props.product.id)
  } catch {
    addError.value = 'Not added to cart. Try again.'
  }
}
</script>

<template>
  <article class="flex flex-col">
    <NuxtLink
      :to="productUrl"
      tabindex="-1"
      aria-hidden="true"
      class="block aspect-square overflow-hidden rounded-lg bg-muted"
    >
      <img
        :src="product.imageUrl"
        alt=""
        width="600"
        height="600"
        loading="lazy"
        class="size-full object-contain p-4"
        :class="{ 'opacity-60 grayscale': !product.inStock }"
      />
    </NuxtLink>

    <p class="mt-3 text-sm text-muted-foreground">{{ product.category.name }}</p>
    <h3 class="leading-snug font-medium">
      <NuxtLink
        :to="productUrl"
        class="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
      >
        {{ product.name }}
      </NuxtLink>
    </h3>

    <div class="mt-auto flex items-center justify-between gap-3 pt-3">
      <p class="text-lg font-semibold">{{ formatPrice(product.price) }}</p>
      <button
        v-if="product.inStock"
        type="button"
        class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70 sm:px-4"
        :disabled="isAdding"
        :aria-label="`Add ${product.name} to cart`"
        @click="addToCart"
      >
        <AppIcon
          :name="isAdding ? 'spinner' : 'cart-plus'"
          :class="['sm:hidden', { 'animate-spin motion-reduce:animate-none': isAdding }]"
        />
        <span class="hidden sm:inline">{{ isAdding ? 'Adding…' : 'Add to cart' }}</span>
      </button>
      <span v-else class="text-sm font-medium text-muted-foreground">Out of stock</span>
    </div>
    <p v-if="addError" role="alert" class="mt-2 text-sm text-destructive">{{ addError }}</p>
  </article>
</template>
