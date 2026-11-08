<script setup lang="ts">
import type { Product } from '#shared/types/catalog'

// Pass `loading` to render skeleton placeholders with the same footprint as real cards.
// `columns` sets the desktop column count (3 when a filter sidebar takes space).
withDefaults(
  defineProps<{
    products?: Product[]
    loading?: boolean
    skeletonCount?: number
    columns?: 3 | 4
  }>(),
  { products: () => [], loading: false, skeletonCount: 4, columns: 4 },
)
</script>

<template>
  <ul
    :class="[
      'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6',
      columns === 3 ? 'sm:grid-cols-3' : 'lg:grid-cols-4',
    ]"
  >
    <template v-if="loading">
      <li v-for="n in skeletonCount" :key="n" aria-hidden="true">
        <div class="aspect-square rounded-lg bg-muted motion-safe:animate-pulse" />
        <div class="mt-3 h-4 w-1/3 rounded bg-muted motion-safe:animate-pulse" />
        <div class="mt-2 h-5 w-4/5 rounded bg-muted motion-safe:animate-pulse" />
        <div class="mt-4 h-11 w-full rounded-full bg-muted motion-safe:animate-pulse" />
      </li>
    </template>
    <li v-for="product in products" v-else :key="product.id" class="flex">
      <ProductCard :product="product" class="w-full" />
    </li>
  </ul>
</template>
