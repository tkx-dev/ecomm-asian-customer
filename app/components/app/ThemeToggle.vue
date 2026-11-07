<script setup lang="ts">
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggle"
  >
    <AppIcon :name="isDark ? 'sun' : 'moon'" />
  </button>
</template>
