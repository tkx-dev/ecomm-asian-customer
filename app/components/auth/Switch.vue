<script setup lang="ts">
import type { AuthMode } from '#shared/types/auth'

// The brand's infinity mark doubles as the sign-in / create-account switch.
// Left loop = sign in, right loop = create account. The dot travels the line between them.
const props = defineProps<{ mode: AuthMode }>()

const PATH = 'M200 100C250 30 380 30 380 100S250 170 200 100C150 30 20 30 20 100S150 170 200 100Z'
// Position along the path (0–1). The path is symmetric, so its outer points sit at 25% and 75%.
const STOPS: Record<AuthMode, number> = { register: 0.25, login: 0.75 }
const POINTS: Record<AuthMode, { x: number; y: number }> = {
  register: { x: 380, y: 100 },
  login: { x: 20, y: 100 },
}
const DURATION = 900

// /login and /register are separate pages, so this component remounts on every switch.
// The last shown mode survives in useState: the dot starts there and travels to the new one.
const lastMode = useState<AuthMode>('auth-switch-mode', () => props.mode)
const pathEl = ref<SVGPathElement>()
const dot = ref({ ...POINTS[lastMode.value] })
// The pill highlight also starts on the last mode, then slides over (CSS transition) once mounted.
const pill = ref<AuthMode>(lastMode.value)
let frame = 0

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

onMounted(() => {
  const from = STOPS[lastMode.value]
  const to = STOPS[props.mode]
  lastMode.value = props.mode
  // Two frames: let the browser paint the starting position first so the transition runs.
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => (pill.value = props.mode))
  })
  const path = pathEl.value
  if (from === to) return
  if (!path || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dot.value = { ...POINTS[props.mode] }
    return
  }
  const total = path.getTotalLength()
  const startedAt = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - startedAt) / DURATION, 1)
    const point = path.getPointAtLength((from + (to - from) * ease(t)) * total)
    dot.value = { x: point.x, y: point.y }
    if (t < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))

const links: { mode: AuthMode; to: string; label: string }[] = [
  { mode: 'login', to: '/login', label: 'Sign in' },
  { mode: 'register', to: '/register', label: 'Create account' },
]
</script>

<template>
  <nav aria-label="Account access" class="mx-auto w-full max-w-80">
    <svg viewBox="0 0 400 200" class="w-full overflow-visible" aria-hidden="true">
      <path
        ref="pathEl"
        :d="PATH"
        fill="none"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
        class="text-secondary dark:text-muted"
      />
      <circle
        :cx="dot.x"
        :cy="dot.y"
        r="17"
        class="fill-primary stroke-background"
        stroke-width="6"
      />
    </svg>
    <div class="relative mt-2 rounded-full border bg-muted p-1">
      <!-- Sliding highlight behind the active link -->
      <span
        aria-hidden="true"
        :class="[
          'pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-md transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
          pill === 'register' && 'translate-x-full',
        ]"
      />
      <ul class="relative grid grid-cols-2">
        <li v-for="link in links" :key="link.mode">
          <!-- Text turns light only as the highlight arrives (delay), so it stays readable mid-slide -->
          <NuxtLink
            :to="{ path: link.to, query: $route.query }"
            :aria-current="mode === link.mode ? 'page' : undefined"
            :class="[
              'flex min-h-11 w-full items-center justify-center rounded-full px-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              pill === link.mode
                ? 'text-primary-foreground delay-300 duration-200 motion-reduce:delay-0'
                : 'text-muted-foreground duration-150 hover:text-foreground',
            ]"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
