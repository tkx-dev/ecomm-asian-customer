<script setup lang="ts">
import type { AuthMode, SocialProvider } from '#shared/types/auth'
import { register, signIn, signInWithProvider, type MockScenario } from '~/services/auth'

// Shared body of pages/login.vue and pages/register.vue.
const props = defineProps<{ mode: AuthMode }>()

const route = useRoute()
const isLogin = computed(() => props.mode === 'login')

// Dev only: preview states with ?mock=loading | error (applies when the form is submitted)
const scenario = computed<MockScenario>(() => {
  const value = route.query.mock
  return import.meta.dev && (value === 'loading' || value === 'error') ? value : 'ok'
})

// Only follow same-site paths after sign-in.
const redirectTo = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
})

// Email lives in memory across /login and /register so switching keeps what was typed.
const email = useState('auth-email', () => '')
const form = reactive({ name: '', email, password: '' })
type FieldKey = keyof typeof form
const errors = reactive<Record<FieldKey, string>>({ name: '', email: '', password: '' })
const fieldRefs: Partial<Record<FieldKey, { focus: () => void }>> = {}
// Which action is running. Only one at a time: the other buttons are disabled meanwhile.
const pending = ref<'email' | SocialProvider | null>(null)
// `hint` tells the user what to do next, which differs for the form and the provider buttons.
const formError = ref<{ message: string; hint: string } | null>(null)

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'The server did not respond.'

const activeFields = computed<FieldKey[]>(() =>
  isLogin.value ? ['email', 'password'] : ['name', 'email', 'password'],
)

for (const key of Object.keys(form) as FieldKey[]) {
  watch(
    () => form[key],
    () => (errors[key] = ''),
  )
}

// Presence and format only. Password rules come from the API. [TODO: ask] for the policy.
function validate() {
  errors.name = !isLogin.value && !form.name.trim() ? 'Enter your name.' : ''
  errors.email = !form.email.trim()
    ? 'Enter your email address.'
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? ''
      : 'Enter an email address like name@example.com.'
  errors.password = !form.password ? 'Enter your password.' : ''

  const firstInvalid = activeFields.value.find((key) => errors[key])
  if (firstInvalid) fieldRefs[firstInvalid]?.focus()
  return !firstInvalid
}

async function submit() {
  if (pending.value) return
  formError.value = null
  if (!validate()) return
  pending.value = 'email'
  try {
    const email = form.email.trim()
    if (isLogin.value) await signIn({ email, password: form.password }, scenario.value)
    else await register({ name: form.name.trim(), email, password: form.password }, scenario.value)
    await navigateTo(redirectTo.value)
  } catch (error) {
    formError.value = {
      message: errorMessage(error),
      hint: `Check your details and select ${copy.value.submit} again.`,
    }
  } finally {
    pending.value = null
  }
}

// One button for both pages: the provider signs in an existing account or creates a new one.
async function continueWith(provider: SocialProvider) {
  if (pending.value) return
  formError.value = null
  pending.value = provider
  try {
    await signInWithProvider(provider, scenario.value)
    await navigateTo(redirectTo.value)
  } catch (error) {
    const name = provider === 'google' ? 'Google' : 'Facebook'
    formError.value = {
      message: errorMessage(error),
      hint: `Try Continue with ${name} again, or use your email instead.`,
    }
  } finally {
    pending.value = null
  }
}

const copy = computed(() =>
  isLogin.value
    ? {
        title: 'Sign in to your account',
        lead: 'Check your orders and check out with your saved addresses.',
        submit: 'Sign in',
        pending: 'Signing in',
        failed: 'Sign-in failed',
      }
    : {
        title: 'Create your account',
        lead: 'You need an account to place an order and follow its delivery.',
        submit: 'Create account',
        pending: 'Creating account',
        failed: 'Account not created',
      },
)

useSeoMeta({
  title: () => `${isLogin.value ? 'Sign in' : 'Create account'} | InfinityShop`,
  robots: 'noindex',
})

const benefits = [
  { icon: 'truck', text: 'Follow each order from payment to delivery, with its tracking number.' },
  { icon: 'package', text: 'Save shipping addresses so checkout takes one step.' },
  { icon: 'wallet', text: 'Pay from your crypto wallet. Your order updates when payment lands.' },
] as const
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
    <div class="grid overflow-hidden rounded-xl border bg-card lg:grid-cols-[0.9fr_1.1fr]">
      <!-- Context panel: desktop only, so the form comes first on small screens -->
      <!-- In dark mode the card is navy too, so a divider keeps the panel distinct -->
      <aside
        class="hidden flex-col justify-between bg-hero p-10 text-hero-foreground lg:flex dark:border-r"
      >
        <div>
          <h2 class="text-3xl leading-tight font-semibold tracking-tight text-balance">
            One account for every order
          </h2>
          <ul class="mt-8 space-y-5">
            <li v-for="item in benefits" :key="item.icon" class="flex gap-4">
              <span
                class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-hero-foreground/10 text-hero-accent"
              >
                <AppIcon :name="item.icon" />
              </span>
              <p class="pt-2 leading-relaxed text-hero-muted">{{ item.text }}</p>
            </li>
          </ul>
        </div>
        <p class="mt-12 text-sm text-hero-muted">
          Order amounts and payment status always come from our store, never from your browser.
        </p>
      </aside>

      <section class="px-5 py-10 sm:px-12 md:py-14" aria-labelledby="auth-title">
        <div class="mx-auto max-w-sm">
          <AuthSwitch :mode="mode" />

          <h1
            id="auth-title"
            class="mt-8 text-center text-3xl font-semibold tracking-tight text-balance"
          >
            {{ copy.title }}
          </h1>
          <p class="mt-2 text-center text-muted-foreground">{{ copy.lead }}</p>

          <div
            v-if="formError"
            role="alert"
            class="mt-8 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
          >
            <AppIcon name="alert" class="mt-0.5 text-destructive" />
            <div class="text-sm">
              <p class="font-semibold">{{ copy.failed }}</p>
              <p class="mt-1 text-muted-foreground">{{ formError.message }} {{ formError.hint }}</p>
            </div>
          </div>

          <AuthSocialButtons
            class="mt-8"
            :pending="pending === 'email' ? null : pending"
            :disabled="!!pending"
            @select="continueWith"
          />

          <div class="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <span class="h-px flex-1 bg-border" aria-hidden="true" />
            or use your email
            <span class="h-px flex-1 bg-border" aria-hidden="true" />
          </div>

          <form
            class="mt-6 space-y-5"
            novalidate
            :aria-busy="pending === 'email'"
            @submit.prevent="submit"
          >
            <AuthField
              v-if="!isLogin"
              id="auth-name"
              :ref="(el) => (fieldRefs.name = el as never)"
              v-model="form.name"
              label="Full name"
              autocomplete="name"
              :error="errors.name"
            />
            <AuthField
              id="auth-email"
              :ref="(el) => (fieldRefs.email = el as never)"
              v-model="form.email"
              label="Email"
              type="email"
              autocomplete="email"
              :error="errors.email"
            />
            <AuthField
              id="auth-password"
              :ref="(el) => (fieldRefs.password = el as never)"
              v-model="form.password"
              label="Password"
              type="password"
              :autocomplete="isLogin ? 'current-password' : 'new-password'"
              :error="errors.password"
            />

            <button
              type="submit"
              :disabled="!!pending"
              class="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70"
            >
              <AppIcon
                v-if="pending === 'email'"
                name="spinner"
                :size="18"
                class="animate-spin motion-reduce:animate-none"
              />
              {{ pending === 'email' ? copy.pending : copy.submit }}
            </button>
          </form>

          <p class="mt-8 text-center text-sm text-muted-foreground">
            {{ isLogin ? 'New to InfinityShop?' : 'Already have an account?' }}&#32;
            <NuxtLink
              :to="{ path: isLogin ? '/register' : '/login', query: route.query }"
              class="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {{ isLogin ? 'Create an account' : 'Sign in' }}
            </NuxtLink>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
