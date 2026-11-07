<script setup lang="ts">
defineProps<{ id: string; title: string; linkTo?: string; linkLabel?: string }>()
</script>

<template>
  <div class="flex items-end justify-between gap-4">
    <h2 :id="id" class="text-2xl font-semibold tracking-tight sm:text-3xl">{{ title }}</h2>
    <NuxtLink
      v-if="linkTo"
      :to="linkTo"
      class="inline-flex min-h-11 shrink-0 items-center font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
    >
      {{ linkLabel }}
    </NuxtLink>
  </div>
</template>
