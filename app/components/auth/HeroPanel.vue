<script setup lang="ts">
// Navy context panel beside the sign-in / sign-up form (desktop only).
// Decoration is all SVG + CSS from the hero tokens, so it follows the brand and needs no image.

// Same infinity shape as the logo and AuthSwitch.
const PATH = 'M200 100C250 30 380 30 380 100S250 170 200 100C150 30 20 30 20 100S150 170 200 100Z'
// Echo lines around the main mark, scaled from the centre (200,100).
const echoes = [
  { scale: 1.18, opacity: 0.16 },
  { scale: 1.38, opacity: 0.1 },
  { scale: 1.6, opacity: 0.05 },
]

const benefits = [
  { icon: 'truck', text: 'Follow each order from payment to delivery, with its tracking number.' },
  { icon: 'package', text: 'Save shipping addresses so checkout takes one step.' },
  { icon: 'wallet', text: 'Pay from your crypto wallet. Your order updates when payment lands.' },
] as const

// Illustration of the order timeline customers see. Labels only, no made-up order data.
const steps = ['Paid', 'Processing', 'Shipped', 'Delivered']
const current = 2
</script>

<template>
  <aside
    class="relative isolate hidden flex-col justify-between overflow-hidden bg-hero p-10 text-hero-foreground lg:flex dark:border-r"
  >
    <!-- Background: glow, dot grid and an oversized infinity mark -->
    <div class="glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
    <div class="dots pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
    <svg
      viewBox="0 0 400 200"
      class="pointer-events-none absolute top-[57%] left-1/2 -z-10 w-[105%] -translate-x-1/2 -translate-y-1/2 -rotate-12 overflow-visible text-hero-accent"
      aria-hidden="true"
    >
      <path
        v-for="echo in echoes"
        :key="echo.scale"
        :d="PATH"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
        :opacity="echo.opacity"
        :transform="`translate(200 100) scale(${echo.scale}) translate(-200 -100)`"
      />
      <path
        id="auth-panel-infinity"
        :d="PATH"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
        opacity="0.45"
      />
      <!-- A small light travelling the mark. Hidden when the user prefers reduced motion. -->
      <g class="traveller">
        <circle r="9" fill="currentColor" opacity="0.25">
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
            <mpath href="#auth-panel-infinity" />
          </animateMotion>
        </circle>
        <circle r="3.5" fill="currentColor">
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
            <mpath href="#auth-panel-infinity" />
          </animateMotion>
        </circle>
      </g>
    </svg>

    <div>
      <h2 class="text-3xl leading-tight font-semibold tracking-tight text-balance">
        One account for every order
      </h2>
      <ul class="mt-8 space-y-5">
        <li v-for="item in benefits" :key="item.icon" class="flex gap-4">
          <span
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-hero-foreground/10 text-hero-accent ring-1 ring-hero-foreground/10"
          >
            <AppIcon :name="item.icon" />
          </span>
          <p class="pt-2 leading-relaxed text-hero-muted">{{ item.text }}</p>
        </li>
      </ul>
    </div>

    <div class="mt-12 space-y-6">
      <!-- Order timeline preview -->
      <div
        class="rounded-xl border border-hero-foreground/10 bg-hero-foreground/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-md"
      >
        <p class="font-medium">Every order shows where it is</p>
        <ol class="mt-5 grid grid-cols-4">
          <li v-for="(step, i) in steps" :key="step" class="relative flex flex-col items-center">
            <!-- Connector to the next step -->
            <span
              v-if="i < steps.length - 1"
              aria-hidden="true"
              :class="[
                'absolute top-[7px] left-1/2 h-0.5 w-full',
                i < current ? 'bg-hero-accent' : 'bg-hero-foreground/15',
              ]"
            />
            <span class="relative flex size-4 items-center justify-center" aria-hidden="true">
              <span
                v-if="i === current"
                class="absolute inline-flex size-full animate-ping rounded-full bg-hero-accent opacity-60 motion-reduce:animate-none"
              />
              <span
                :class="[
                  'relative size-4 rounded-full border-2',
                  i <= current
                    ? 'border-hero-accent bg-hero-accent'
                    : 'border-hero-foreground/30 bg-hero',
                ]"
              />
            </span>
            <span
              :class="[
                'mt-2 text-xs',
                i === current ? 'font-semibold text-hero-foreground' : 'text-hero-muted',
              ]"
            >
              {{ step }}
            </span>
          </li>
        </ol>
        <p class="mt-5 text-sm text-hero-muted">
          The tracking number appears here as soon as your order ships.
        </p>
      </div>

      <p class="text-sm text-hero-muted">
        Order amounts and payment status always come from our store, never from your browser.
      </p>
    </div>
  </aside>
</template>

<style scoped>
.glow {
  background:
    radial-gradient(
      circle at 85% 8%,
      color-mix(in oklab, var(--hero-accent) 28%, transparent),
      transparent 55%
    ),
    radial-gradient(
      circle at 0% 100%,
      color-mix(in oklab, var(--hero-accent) 14%, transparent),
      transparent 50%
    );
}

.dots {
  background-image: radial-gradient(
    color-mix(in oklab, var(--hero-foreground) 16%, transparent) 1px,
    transparent 1px
  );
  background-size: 22px 22px;
  mask-image: linear-gradient(to bottom, black, transparent 70%);
}

@media (prefers-reduced-motion: reduce) {
  .traveller {
    display: none;
  }
}
</style>
