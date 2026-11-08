<script setup lang="ts">
import { getHomeData, type MockScenario } from '~/services/catalog'

const route = useRoute()

// Dev only: preview page states with ?mock=loading | error | empty
const scenario = computed<MockScenario>(() => {
  const value = route.query.mock
  return import.meta.dev && (value === 'loading' || value === 'error' || value === 'empty')
    ? value
    : 'ok'
})

const { data, status, error, refresh } = await useAsyncData(
  'home',
  () => getHomeData(scenario.value),
  { lazy: true, server: scenario.value === 'ok', watch: [scenario] },
)

const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')
const isEmpty = computed(
  () =>
    !!data.value &&
    !data.value.categories.length &&
    !data.value.featured.length &&
    !data.value.newArrivals.length,
)

useSeoMeta({
  title: 'InfinityShop | Shop everything, pay with crypto',
  description:
    'Browse electronics, home goods, fashion and more. Pay with cryptocurrency and track every order.',
})

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
</script>

<template>
  <div>
    <HomeHero :slides="data?.heroSlides ?? []" :loading="isLoading" />

    <!-- Error -->
    <section v-if="status === 'error'" :class="[container, 'py-20']" aria-live="polite">
      <div class="mx-auto max-w-md text-center">
        <h2 class="text-2xl font-semibold">Products could not be loaded</h2>
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

    <!-- Empty -->
    <section v-else-if="isEmpty" :class="[container, 'py-20']">
      <div class="mx-auto max-w-md text-center">
        <AppIcon name="package" :size="40" class="mx-auto text-muted-foreground" />
        <h2 class="mt-4 text-2xl font-semibold">No products yet</h2>
        <p class="mt-2 text-muted-foreground">
          New products appear here as soon as sellers add them.
        </p>
        <button
          type="button"
          class="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-6 font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          @click="() => refresh()"
        >
          <AppIcon name="refresh" :size="18" />
          Check again
        </button>
      </div>
    </section>

    <!-- Loading and success share the same layout so nothing shifts when data arrives -->
    <div v-else :aria-busy="isLoading">
      <section :class="[container, 'py-16']" aria-labelledby="categories-title">
        <HomeSectionHeading id="categories-title" title="Shop by category" />
        <div class="mt-8">
          <ul
            v-if="isLoading"
            class="grid grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-6"
            aria-hidden="true"
          >
            <li v-for="n in 6" :key="n">
              <div class="aspect-square rounded-full bg-muted motion-safe:animate-pulse" />
              <div class="mx-auto mt-3 h-4 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
            </li>
          </ul>
          <HomeCategoryGrid v-else :categories="data?.categories ?? []" />
        </div>
      </section>

      <section
        v-if="isLoading || data?.featured.length"
        :class="[container, 'pb-16']"
        aria-labelledby="featured-title"
      >
        <HomeSectionHeading
          id="featured-title"
          title="Featured"
          link-to="/products"
          link-label="View all products"
        />
        <ProductGrid class="mt-8" :products="data?.featured" :loading="isLoading" />
      </section>

      <HomeHowItWorks />

      <section
        v-if="isLoading || data?.newArrivals.length"
        :class="[container, 'pt-16']"
        aria-labelledby="new-title"
      >
        <HomeSectionHeading
          id="new-title"
          title="New arrivals"
          link-to="/products"
          link-label="View all products"
        />
        <ProductGrid
          class="mt-8"
          :products="data?.newArrivals"
          :loading="isLoading"
          :skeleton-count="8"
        />
      </section>
    </div>
  </div>
</template>
