<template>
  <div class="min-h-screen">
    <NuxtRouteAnnouncer />
    <main class="mx-auto max-w-3xl space-y-6 p-8">
      <header class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Theme preview</h1>
        <ThemeToggle />
      </header>

      <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 class="text-lg font-semibold">Product card</h2>
        <p class="mt-1 text-muted-foreground">Semantic colors adapt to light and dark mode.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button class="rounded-md bg-primary px-4 py-2 text-primary-foreground">Primary</button>
          <button class="rounded-md bg-secondary px-4 py-2 text-secondary-foreground">
            Secondary
          </button>
          <button class="rounded-md bg-accent px-4 py-2 text-accent-foreground">Accent</button>
          <button class="rounded-md bg-destructive px-4 py-2 text-destructive-foreground">
            Delete
          </button>
        </div>
        <div class="mt-4 flex gap-2 text-sm">
          <span class="rounded-full bg-success px-2.5 py-0.5 text-success-foreground"
            >In stock</span
          >
          <span class="rounded-full bg-warning px-2.5 py-0.5 text-warning-foreground"
            >Low stock</span
          >
        </div>
      </div>
    </main>
  </div>
</template>
