<script setup lang="ts">
import type { Category } from '#shared/types/catalog'

defineProps<{ categories: Category[] }>()
</script>

<template>
  <ul class="grid grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-6">
    <li v-for="category in categories" :key="category.slug">
      <NuxtLink
        :to="{ path: '/products', query: { category: category.slug } }"
        class="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <div class="aspect-square overflow-hidden rounded-full bg-muted">
          <img
            :src="category.imageUrl"
            alt=""
            width="300"
            height="300"
            loading="lazy"
            class="size-full object-contain p-5"
          />
        </div>
        <p class="mt-3 text-center font-medium group-hover:text-primary">{{ category.name }}</p>
        <p class="text-center text-sm text-muted-foreground">
          {{ category.productCount }} products
        </p>
      </NuxtLink>
    </li>
  </ul>
</template>
