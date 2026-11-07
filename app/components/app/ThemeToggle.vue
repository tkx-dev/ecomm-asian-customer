<script setup lang="ts">
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggle"
  >
    <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
    {{ isDark ? 'Light' : 'Dark' }}
  </button>
</template>
