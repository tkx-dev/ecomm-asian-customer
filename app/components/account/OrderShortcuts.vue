<script setup lang="ts">
import type { IconName } from '~/components/app/Icon.vue'
import type { OrderCounts, OrderStatus, OrderSummary } from '#shared/types/order'

// Mobile "My orders" panel: one shortcut per delivery stage and the order waiting for payment.
// Counts and the payment deadline come from the API. The countdown only formats that deadline.
const props = defineProps<{
  counts?: OrderCounts
  awaitingPayment?: OrderSummary | null
  loading: boolean
}>()

const tiles = computed(() => {
  const c = props.counts ?? {}
  const stages: { status: OrderStatus; icon: IconName; count: number }[] = [
    { status: 'pending_payment', icon: 'wallet', count: c.pending_payment ?? 0 },
    // A paid order is waiting to be processed, so it is shown with processing orders.
    { status: 'processing', icon: 'package', count: (c.paid ?? 0) + (c.processing ?? 0) },
    { status: 'shipped', icon: 'truck', count: c.shipped ?? 0 },
    { status: 'delivered', icon: 'package-check', count: c.delivered ?? 0 },
  ]
  return stages.map((stage) => ({ ...stage, label: orderStatusLabel[stage.status] }))
})

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => (timer = setInterval(() => (now.value = Date.now()), 1000)))
onBeforeUnmount(() => clearInterval(timer))

const dueAt = computed(() => props.awaitingPayment?.paymentDueAt ?? null)
const remaining = computed(() =>
  dueAt.value ? Math.max(0, Date.parse(dueAt.value) - now.value) : null,
)
const countdown = computed(() => {
  if (remaining.value === null) return ''
  const total = Math.floor(remaining.value / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
})
</script>

<template>
  <section aria-labelledby="my-orders-title">
    <div class="flex items-center justify-between gap-4">
      <h2 id="my-orders-title" class="text-xl font-semibold tracking-tight">My orders</h2>
      <NuxtLink
        to="/orders"
        class="-mr-2 inline-flex min-h-11 items-center gap-0.5 rounded-md px-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        View all orders
        <AppIcon name="chevron-right" :size="16" />
      </NuxtLink>
    </div>

    <ul class="mt-3 grid grid-cols-4">
      <li v-for="tile in tiles" :key="tile.status">
        <NuxtLink
          :to="{ path: '/orders', query: { status: tile.status } }"
          class="flex h-full flex-col items-center gap-2 rounded-lg px-1 py-2 text-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span class="relative text-foreground">
            <AppIcon :name="tile.icon" :size="28" />
            <span
              v-if="!loading && tile.count"
              aria-hidden="true"
              class="absolute -top-1.5 -right-2.5 min-w-5 rounded-full bg-primary px-1 text-center text-xs leading-5 font-semibold text-primary-foreground"
            >
              {{ tile.count > 99 ? '99+' : tile.count }}
            </span>
          </span>
          <span class="text-xs leading-tight">
            {{ tile.label }}
            <span v-if="!loading" class="sr-only">
              , {{ tile.count }} {{ tile.count === 1 ? 'order' : 'orders' }}
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>

    <div v-if="loading" class="mt-3 h-[4.5rem] rounded-lg bg-muted motion-safe:animate-pulse" />

    <NuxtLink
      v-else-if="awaitingPayment"
      :to="`/orders/${awaitingPayment.id}`"
      class="mt-3 flex items-center gap-3 rounded-lg bg-muted p-3 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span
        class="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-warning text-warning-foreground"
      >
        <AppIcon name="wallet" :size="22" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate font-semibold">Order {{ awaitingPayment.number }} to pay</span>
        <span class="block text-sm text-muted-foreground">
          {{ formatPrice(awaitingPayment.total)
          }}<span v-if="dueAt && remaining"
            >, pay within
            <time :datetime="dueAt" class="font-medium text-foreground tabular-nums">{{
              countdown
            }}</time></span
          ><span v-else-if="dueAt">, payment time is up</span>
        </span>
      </span>
      <span class="inline-flex shrink-0 items-center font-semibold text-primary">
        Pay now
        <AppIcon name="chevron-right" :size="16" />
      </span>
    </NuxtLink>
  </section>
</template>
