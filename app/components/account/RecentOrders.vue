<script setup lang="ts">
import type { OrderSummary } from '#shared/types/order'

// Latest orders as the API sends them. Totals and statuses are shown, never computed.
defineProps<{ orders?: OrderSummary[]; loading: boolean }>()
</script>

<template>
  <section id="orders" class="scroll-mt-24" aria-labelledby="orders-title">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id="orders-title" class="text-xl font-semibold tracking-tight lg:text-2xl">
          Recent orders
        </h2>
        <p class="mt-1 text-muted-foreground">Open an order to see its delivery and tracking.</p>
      </div>
      <NuxtLink
        v-if="loading || orders?.length"
        to="/orders"
        class="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        View all orders
      </NuxtLink>
    </div>

    <ul v-if="loading" class="mt-8 divide-y rounded-xl border bg-card" aria-hidden="true">
      <li v-for="n in 3" :key="n" class="flex items-center gap-4 p-5">
        <div class="space-y-2">
          <div class="h-4 w-28 rounded bg-muted motion-safe:animate-pulse" />
          <div class="h-3 w-40 rounded bg-muted motion-safe:animate-pulse" />
        </div>
        <div class="ml-auto h-6 w-24 rounded-full bg-muted motion-safe:animate-pulse" />
      </li>
    </ul>

    <div
      v-else-if="!orders?.length"
      class="mt-8 rounded-xl border-2 border-dashed px-6 py-12 text-center"
    >
      <AppIcon name="package" :size="36" class="mx-auto text-muted-foreground" />
      <h3 class="mt-4 text-lg font-semibold">No orders yet</h3>
      <p class="mx-auto mt-1 max-w-sm text-muted-foreground">
        Orders you place show up here with their delivery status.
      </p>
      <NuxtLink
        to="/products"
        class="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Browse products
      </NuxtLink>
    </div>

    <ul v-else class="mt-8 divide-y overflow-hidden rounded-xl border bg-card text-card-foreground">
      <li v-for="order in orders" :key="order.id">
        <NuxtLink
          :to="`/orders/${order.id}`"
          class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 p-5 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:grid-cols-[1fr_auto_auto]"
        >
          <div>
            <p class="font-semibold">Order {{ order.number }}</p>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(order.placedAt) }}, {{ order.itemCount }}
              {{ order.itemCount === 1 ? 'item' : 'items' }}
            </p>
          </div>
          <p class="text-right font-semibold tabular-nums sm:order-last sm:w-24">
            {{ formatPrice(order.total) }}
          </p>
          <span
            :class="[
              'col-span-2 justify-self-start rounded-full px-2.5 py-0.5 text-xs font-semibold sm:col-span-1 sm:justify-self-end',
              orderStatusTone[order.status],
            ]"
          >
            {{ orderStatusLabel[order.status] }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
