<script setup lang="ts">
const { itemCount } = useCart()
const route = useRoute()

const query = ref('')
const menuOpen = ref(false)

function search() {
  const q = query.value.trim()
  if (!q) return
  navigateTo({ path: '/products', query: { q } })
}

watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
)

const navLinks = [
  { to: '/products', label: 'All products' },
  { to: '/orders', label: 'Orders' },
]

const iconButton =
  'relative inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring'
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75"
    @keydown.esc="menuOpen = false"
  >
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
      <AppLogo />

      <nav aria-label="Main" class="ml-4 hidden items-center gap-1 lg:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          active-class="text-foreground"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <form role="search" class="ml-auto hidden max-w-md flex-1 md:block" @submit.prevent="search">
        <label for="header-search" class="sr-only">Search products</label>
        <div class="relative">
          <AppIcon
            name="search"
            :size="18"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="header-search"
            v-model="query"
            type="search"
            placeholder="Search products"
            class="h-11 w-full rounded-full border border-input bg-background pr-4 pl-10 text-base placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
          />
        </div>
      </form>

      <div class="ml-auto flex items-center gap-1 md:ml-0">
        <NuxtLink to="/account" :class="iconButton" aria-label="Your account">
          <AppIcon name="user" />
        </NuxtLink>
        <NuxtLink
          to="/cart"
          :class="iconButton"
          :aria-label="itemCount ? `Cart, ${itemCount} items` : 'Cart'"
        >
          <AppIcon name="cart" />
          <span
            v-if="itemCount"
            aria-hidden="true"
            class="absolute top-1 right-0.5 min-w-5 rounded-full bg-primary px-1 text-center text-xs leading-5 font-semibold text-primary-foreground"
          >
            {{ itemCount }}
          </span>
        </NuxtLink>
        <AppThemeToggle />
        <button
          type="button"
          :class="[iconButton, 'cursor-pointer lg:hidden']"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </div>

    <form role="search" class="px-4 pb-3 sm:px-6 md:hidden" @submit.prevent="search">
      <label for="mobile-search" class="sr-only">Search products</label>
      <div class="relative">
        <AppIcon
          name="search"
          :size="18"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id="mobile-search"
          v-model="query"
          type="search"
          placeholder="Search products"
          class="h-11 w-full rounded-full border border-input bg-background pr-4 pl-10 text-base placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
        />
      </div>
    </form>

    <nav
      v-show="menuOpen"
      id="mobile-menu"
      aria-label="Mobile"
      class="border-t bg-background px-4 py-2 sm:px-6 lg:hidden"
    >
      <ul>
        <li v-for="link in [...navLinks, { to: '/login', label: 'Sign in' }]" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="flex min-h-11 items-center rounded-md px-2 font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
