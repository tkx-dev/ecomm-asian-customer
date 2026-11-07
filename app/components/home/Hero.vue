<script setup lang="ts">
import type { Product } from '#shared/types/catalog'

// The two products shown inside the loops of the infinity mark. Empty while loading.
defineProps<{ products: Product[] }>()

const loops = [
  { left: '13.75%', top: '22.5%' },
  { left: '58.75%', top: '22.5%' },
]
</script>

<template>
  <section class="bg-hero text-hero-foreground" aria-labelledby="hero-title">
    <div
      class="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.1fr] lg:px-8"
    >
      <div class="max-w-xl">
        <h1
          id="hero-title"
          class="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          Shop everything. Pay with crypto.
        </h1>
        <p class="mt-5 text-lg leading-relaxed text-hero-muted">
          Electronics, home goods, fashion and more. Check out from your crypto wallet and follow
          every order until it reaches your door.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <NuxtLink
            to="/products"
            class="inline-flex min-h-12 items-center rounded-full bg-hero-accent px-6 font-semibold text-hero transition-colors hover:bg-hero-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
          >
            Browse products
          </NuxtLink>
          <a
            href="#how-it-works"
            class="inline-flex min-h-12 items-center rounded-full border border-hero-foreground/30 px-6 font-medium transition-colors hover:bg-hero-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
          >
            How crypto checkout works
          </a>
        </div>
      </div>

      <div class="relative mx-auto aspect-[2/1] w-full max-w-xl" aria-hidden="true">
        <svg viewBox="0 0 400 200" class="absolute inset-0 size-full overflow-visible">
          <path
            class="infinity-line"
            pathLength="1"
            d="M200 100C250 30 380 30 380 100S250 170 200 100C150 30 20 30 20 100S150 170 200 100Z"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <div
          v-for="(loop, i) in loops"
          :key="i"
          class="absolute aspect-square w-[27.5%] overflow-hidden rounded-full bg-hero-foreground/10 ring-4 ring-hero"
          :style="loop"
        >
          <img
            v-if="products[i]"
            :src="products[i].imageUrl"
            alt=""
            width="300"
            height="300"
            class="size-full object-cover"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.infinity-line {
  color: var(--hero-accent);
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  animation: draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) both;
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .infinity-line {
    animation: none;
  }
}
</style>
