<script setup lang="ts">
import type { HeroSlide } from '#shared/types/catalog'

// Home hero carousel. Slides come from the API (dev: mock data).
// Autoplay is driven by the active indicator's CSS progress bar: when it finishes, the next slide shows.
const props = defineProps<{ slides: HeroSlide[]; loading: boolean }>()

const INTERVAL = 6000

// Shown when the API sends no slides or fails, so the hero never collapses.
const fallback: HeroSlide = {
  id: 'fallback',
  title: 'Shop everything. Pay with crypto.',
  description:
    'Electronics, home goods, fashion and more. Check out from your crypto wallet and follow every order until it reaches your door.',
  imageUrl: '',
  cta: { label: 'Browse products', to: '/products' },
}

const items = computed(() => (props.slides.length ? props.slides : [fallback]))
const active = ref(0)
const playing = ref(true)
const hovered = ref(false)
const focused = ref(false)
const running = computed(
  () => playing.value && !hovered.value && !focused.value && items.value.length > 1,
)

watch(items, () => (active.value = 0))

onMounted(() => {
  // No autoplay for people who prefer reduced motion. They can still step through.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) playing.value = false
})

function go(index: number) {
  const count = items.value.length
  active.value = (index + count) % count
}
const next = () => go(active.value + 1)
const prev = () => go(active.value - 1)

// Swipe on touch screens
let startX: number | null = null
function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse') startX = event.clientX
}
function onPointerUp(event: PointerEvent) {
  if (startX === null) return
  const dx = event.clientX - startX
  startX = null
  if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
}

function onFocusOut(event: FocusEvent) {
  const region = event.currentTarget as HTMLElement
  if (!region.contains(event.relatedTarget as Node | null)) focused.value = false
}

const control =
  'inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-hero-foreground/25 text-hero-foreground transition-colors hover:bg-hero-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent'
</script>

<template>
  <section
    class="relative isolate overflow-hidden bg-hero text-hero-foreground"
    aria-roledescription="carousel"
    aria-label="Highlights"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="onFocusOut"
    @keydown.left.prevent="prev"
    @keydown.right.prevent="next"
  >
    <div class="hero-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

    <div class="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 md:pt-16 lg:px-8">
      <!-- Loading: same footprint as a slide so nothing shifts when data arrives -->
      <div
        v-if="loading"
        class="grid items-center gap-10 lg:min-h-[30rem] lg:grid-cols-[1fr_1.1fr]"
        aria-hidden="true"
      >
        <div class="space-y-4">
          <div class="h-12 w-4/5 rounded-lg bg-hero-foreground/10 motion-safe:animate-pulse" />
          <div class="h-12 w-3/5 rounded-lg bg-hero-foreground/10 motion-safe:animate-pulse" />
          <div class="h-5 w-full rounded bg-hero-foreground/10 motion-safe:animate-pulse" />
          <div class="h-5 w-2/3 rounded bg-hero-foreground/10 motion-safe:animate-pulse" />
          <div class="h-12 w-44 rounded-full bg-hero-foreground/10 motion-safe:animate-pulse" />
        </div>
        <div class="aspect-[4/3] rounded-3xl bg-hero-foreground/10 motion-safe:animate-pulse" />
      </div>
      <!-- Placeholder for the controls row -->
      <div v-if="loading" class="mt-10 h-11" aria-hidden="true" />

      <template v-else>
        <!-- Slides are stacked in one grid cell: the tallest one sets the height -->
        <div
          class="grid touch-pan-y select-none"
          :aria-live="running ? 'off' : 'polite'"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
        >
          <article
            v-for="(slide, i) in items"
            :key="slide.id"
            role="group"
            aria-roledescription="slide"
            :aria-label="`${i + 1} of ${items.length}`"
            :inert="i !== active"
            :class="[
              'col-start-1 row-start-1 grid items-center gap-10 transition-opacity duration-700 lg:min-h-[30rem] lg:grid-cols-[1fr_1.1fr]',
              i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
            ]"
          >
            <div
              :class="[
                'max-w-xl transition duration-700 motion-reduce:transition-none',
                i === active ? 'translate-y-0 opacity-100 delay-150' : 'translate-y-4 opacity-0',
              ]"
            >
              <component
                :is="i === 0 ? 'h1' : 'h2'"
                class="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              >
                {{ slide.title }}
              </component>
              <p class="mt-5 text-lg leading-relaxed text-pretty text-hero-muted">
                {{ slide.description }}
              </p>
              <NuxtLink
                :to="slide.cta.to"
                class="mt-8 inline-flex min-h-12 items-center rounded-full bg-hero-accent px-6 font-semibold text-hero transition-colors hover:bg-hero-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-accent"
              >
                {{ slide.cta.label }}
              </NuxtLink>
            </div>

            <div class="relative">
              <div
                class="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] border border-hero-foreground/10"
                aria-hidden="true"
              />
              <div
                class="aspect-[4/3] overflow-hidden rounded-3xl bg-hero-foreground/10 shadow-2xl shadow-black/30"
              >
                <img
                  v-if="slide.imageUrl"
                  :src="slide.imageUrl"
                  alt=""
                  width="1200"
                  height="900"
                  :loading="i === 0 ? 'eager' : 'lazy'"
                  :class="[
                    'size-full object-cover transition-transform ease-out motion-reduce:transition-none',
                    i === active ? 'scale-100 duration-[7000ms]' : 'scale-110 duration-700',
                  ]"
                />
                <div
                  v-else
                  class="flex size-full items-center justify-center text-hero-accent"
                  aria-hidden="true"
                >
                  <AppIcon name="infinity" :size="160" />
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Controls -->
        <div v-if="items.length > 1" class="mt-10 flex items-center gap-4">
          <div class="flex items-center gap-1">
            <button
              v-for="(slide, i) in items"
              :key="slide.id"
              type="button"
              class="group flex h-11 cursor-pointer items-center px-1 focus-visible:outline-2 focus-visible:outline-hero-accent"
              :aria-label="`Show slide ${i + 1}: ${slide.title}`"
              :aria-current="i === active ? 'true' : undefined"
              @click="go(i)"
            >
              <span
                :class="[
                  'relative block h-1.5 overflow-hidden rounded-full bg-hero-foreground/20 transition-all duration-500',
                  i === active ? 'w-12' : 'w-6 group-hover:bg-hero-foreground/40',
                ]"
              >
                <span
                  v-if="i === active"
                  :key="active"
                  class="progress absolute inset-y-0 left-0 rounded-full bg-hero-accent"
                  :style="{
                    animationDuration: `${INTERVAL}ms`,
                    animationPlayState: running ? 'running' : 'paused',
                  }"
                  @animationend="next"
                />
              </span>
            </button>
          </div>

          <p
            class="hidden text-sm whitespace-nowrap text-hero-muted tabular-nums sm:block"
            aria-hidden="true"
          >
            {{ String(active + 1).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}
          </p>

          <div class="ml-auto flex gap-2">
            <button
              type="button"
              :class="control"
              :aria-label="playing ? 'Pause slideshow' : 'Play slideshow'"
              @click="playing = !playing"
            >
              <AppIcon :name="playing ? 'pause' : 'play'" :size="18" />
            </button>
            <button type="button" :class="control" aria-label="Previous slide" @click="prev">
              <AppIcon name="chevron-left" />
            </button>
            <button type="button" :class="control" aria-label="Next slide" @click="next">
              <AppIcon name="chevron-right" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.hero-glow {
  background:
    radial-gradient(
      circle at 75% 20%,
      color-mix(in oklab, var(--hero-accent) 22%, transparent),
      transparent 50%
    ),
    radial-gradient(
      circle at 5% 95%,
      color-mix(in oklab, var(--hero-accent) 12%, transparent),
      transparent 45%
    );
}

.progress {
  width: 0;
  animation-name: fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes fill {
  to {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress {
    animation: none;
    width: 100%;
  }
}
</style>
