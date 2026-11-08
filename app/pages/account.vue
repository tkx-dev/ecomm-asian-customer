<script setup lang="ts">
import type { AccountData } from '#shared/types/account'
import { getAccount, type MockScenario, type MutationScenario } from '~/services/account'
import { signOut } from '~/services/auth'

const route = useRoute()

// Dev only: preview page states with ?mock=loading | error | empty,
// and failed saves / deletes / default changes with ?mock=save-error.
const scenario = computed<MockScenario>(() => {
  const value = route.query.mock
  return import.meta.dev && (value === 'loading' || value === 'error' || value === 'empty')
    ? value
    : 'ok'
})
const mutationScenario = computed<MutationScenario>(() =>
  import.meta.dev && route.query.mock === 'save-error' ? 'error' : 'ok',
)

// Client-only: account data belongs to the signed-in user's session.
// [TODO: ask] Redirect to /login?redirect=/account when the API reports no session.
const { data, status, error, refresh } = await useAsyncData(
  'account',
  () => getAccount(scenario.value),
  { lazy: true, server: false, watch: [scenario] },
)

const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')

// `data` is a shallow ref (Nuxt 4 default): replace the object so the page re-renders.
function patch(changes: Partial<AccountData>) {
  if (data.value) data.value = { ...data.value, ...changes }
}

const initials = computed(() =>
  (data.value?.profile.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join(''),
)

const signingOut = ref(false)
const signOutError = ref('')
async function onSignOut() {
  if (signingOut.value) return
  signingOut.value = true
  signOutError.value = ''
  try {
    await signOut()
    await navigateTo('/login')
  } catch (err) {
    signOutError.value = err instanceof Error ? err.message : 'The server did not respond.'
  } finally {
    signingOut.value = false
  }
}

const sections = [
  { id: 'details', label: 'Personal details', icon: 'user' },
  { id: 'addresses', label: 'Shipping addresses', icon: 'map-pin' },
  { id: 'orders', label: 'Recent orders', icon: 'package' },
] as const

useSeoMeta({ title: 'Your account | InfinityShop', robots: 'noindex' })

// Mobile quick links, in place of the desktop side nav.
const shortcuts = [
  { to: { hash: '#details' }, label: 'Personal details', icon: 'user' },
  { to: { hash: '#addresses' }, label: 'Addresses', icon: 'map-pin' },
  { to: '/orders', label: 'All orders', icon: 'package' },
  { to: '/cart', label: 'Cart', icon: 'cart' },
] as const

const container = 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'
// A white panel per section on mobile. Plain on desktop.
const panel = 'bg-card px-4 py-6 sm:px-6 lg:bg-transparent lg:p-0'
</script>

<template>
  <div>
    <!-- Error -->
    <section v-if="status === 'error'" :class="[container, 'py-20']" aria-live="polite">
      <div class="mx-auto max-w-md text-center">
        <h1 class="text-2xl font-semibold">Your account could not be loaded</h1>
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

    <template v-else>
      <!-- Identity band -->
      <div class="bg-hero text-hero-foreground">
        <div :class="[container, 'flex items-center gap-4 py-6 sm:gap-5 lg:py-10']">
          <div
            class="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-hero-foreground/10 text-xl font-semibold text-hero-accent ring-2 ring-hero-accent"
            aria-hidden="true"
          >
            <span v-if="!isLoading">{{ initials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <template v-if="isLoading">
              <h1 class="sr-only">Your account</h1>
              <div
                class="h-8 w-full max-w-56 rounded bg-hero-foreground/15 motion-safe:animate-pulse"
              />
              <div class="mt-2 h-4 w-40 rounded bg-hero-foreground/10 motion-safe:animate-pulse" />
            </template>
            <template v-else-if="data">
              <h1 class="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
                {{ data.profile.name }}
              </h1>
              <p class="mt-1 text-sm text-hero-muted sm:text-base">
                Member since
                {{ formatDate(data.profile.memberSince, { month: 'long', year: 'numeric' }) }}
              </p>
            </template>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-2 self-start lg:self-center">
            <!-- Icon-only on mobile, like an app's account tab. -->
            <button
              type="button"
              :disabled="signingOut"
              class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-hero-foreground/25 font-medium transition-colors hover:bg-hero-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent disabled:cursor-wait disabled:opacity-70 lg:px-5"
              @click="onSignOut"
            >
              <AppIcon
                :name="signingOut ? 'spinner' : 'log-out'"
                :size="18"
                :class="signingOut && 'animate-spin motion-reduce:animate-none'"
              />
              <span class="max-lg:sr-only">{{ signingOut ? 'Signing out' : 'Sign out' }}</span>
            </button>
            <p v-if="signOutError" role="alert" class="max-w-48 text-right text-sm text-hero-muted">
              {{ signOutError }} Try again.
            </p>
          </div>
        </div>
      </div>

      <!-- Mobile: app-style stack of panels on a tinted ground. Desktop: side nav + sections. -->
      <div class="bg-muted lg:bg-transparent dark:bg-background">
        <div
          :class="[container, 'grid gap-2 max-lg:px-0 lg:grid-cols-[13rem_1fr] lg:gap-12 lg:py-16']"
          :aria-busy="isLoading"
        >
          <nav aria-label="Account sections" class="hidden lg:block">
            <ul class="sticky top-24 space-y-1">
              <li v-for="section in sections" :key="section.id">
                <a
                  :href="`#${section.id}`"
                  class="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <AppIcon :name="section.icon" :size="18" />
                  {{ section.label }}
                </a>
              </li>
            </ul>
          </nav>

          <div class="min-w-0 space-y-2 lg:space-y-16">
            <nav aria-label="Account shortcuts" :class="[panel, 'py-4 lg:hidden']">
              <ul class="grid grid-cols-4 gap-2">
                <li v-for="item in shortcuts" :key="item.label">
                  <NuxtLink
                    :to="item.to"
                    class="flex h-full flex-col items-center gap-2 rounded-lg p-1 text-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span
                      class="relative inline-flex size-12 items-center justify-center rounded-xl bg-muted text-primary"
                    >
                      <AppIcon :name="item.icon" :size="22" />
                    </span>
                    <span class="text-xs leading-tight">{{ item.label }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </nav>

            <AccountOrderShortcuts
              :class="[panel, 'lg:hidden']"
              :counts="data?.orderCounts"
              :awaiting-payment="data?.awaitingPayment"
              :loading="isLoading"
            />
            <AccountProfileForm
              :class="panel"
              :profile="data?.profile"
              :loading="isLoading"
              :scenario="mutationScenario"
              @saved="(profile) => patch({ profile })"
            />
            <AccountAddressBook
              :class="[panel, '[--notch-bg:var(--card)] lg:[--notch-bg:var(--background)]']"
              :addresses="data?.addresses"
              :loading="isLoading"
              :scenario="mutationScenario"
              @update="(addresses) => patch({ addresses })"
            />
            <!-- Mobile shows the order stages above instead. -->
            <AccountRecentOrders
              class="hidden lg:block"
              :orders="data?.recentOrders"
              :loading="isLoading"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
