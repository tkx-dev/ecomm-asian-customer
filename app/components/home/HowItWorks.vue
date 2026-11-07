<script setup lang="ts">
// A real sequence (cart → pay → track), so the steps are numbered.
const steps = [
  {
    icon: 'cart',
    title: 'Add items to your cart',
    body: 'Pick what you need and review your cart. Prices are shown in US dollars.',
  },
  {
    icon: 'wallet',
    title: 'Pay from your crypto wallet',
    body: 'Confirm your order and pay the amount shown at checkout. Accepted coins are listed there.',
  },
  {
    icon: 'truck',
    title: 'Track your order',
    body: 'Follow the status from payment to delivery, with a tracking number once it ships.',
  },
] as const
</script>

<template>
  <section id="how-it-works" aria-labelledby="how-title" class="scroll-mt-24 bg-muted/60">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id="how-title" class="text-2xl font-semibold tracking-tight sm:text-3xl">
        How crypto checkout works
      </h2>
      <ol class="mt-10 grid gap-10 md:grid-cols-3">
        <li v-for="(step, i) in steps" :key="step.title" class="flex gap-4">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <AppIcon :name="step.icon" />
          </span>
          <div>
            <h3 class="text-lg font-semibold">
              <span class="text-muted-foreground">{{ i + 1 }}.</span> {{ step.title }}
            </h3>
            <p class="mt-1 text-muted-foreground">{{ step.body }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
