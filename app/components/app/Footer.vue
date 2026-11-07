<script setup lang="ts">
const columns = [
  {
    title: 'Shop',
    links: [
      { to: '/products', label: 'All products' },
      { to: '/cart', label: 'Cart' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Create an account' },
      { to: '/account/addresses', label: 'Shipping addresses' },
    ],
  },
  {
    title: 'Orders',
    links: [
      { to: '/orders', label: 'Order history' },
      { to: '/orders', label: 'Track a delivery' },
    ],
  },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-24 border-t bg-muted/60">
    <div
      class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8"
    >
      <div class="max-w-xs">
        <AppLogo />
        <p class="mt-3 text-muted-foreground">
          Everyday products, paid for with cryptocurrency and tracked all the way to your door.
        </p>
      </div>

      <nav v-for="column in columns" :key="column.title" :aria-label="column.title">
        <h2 class="font-semibold">{{ column.title }}</h2>
        <ul class="mt-3 space-y-1">
          <li v-for="link in column.links" :key="link.label">
            <NuxtLink
              :to="link.to"
              class="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring md:min-h-9"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="border-t">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8"
      >
        <p>&copy; {{ year }} InfinityShop</p>
        <p class="inline-flex items-center gap-2">
          <AppIcon name="wallet" :size="16" />
          Payments are accepted in cryptocurrency only
        </p>
      </div>
    </div>
  </footer>
</template>
