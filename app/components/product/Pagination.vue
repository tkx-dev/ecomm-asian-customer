<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

// Numbered page links. Links (not buttons) so each page has a shareable URL.
const props = defineProps<{
  page: number
  total: number
  pageSize: number
  to: (page: number) => RouteLocationRaw
}>()

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

// First, last, and two either side of the current page. Gaps become an ellipsis.
const items = computed(() => {
  const keep = new Set([1, pages.value])
  for (let n = props.page - 2; n <= props.page + 2; n++) {
    if (n >= 1 && n <= pages.value) keep.add(n)
  }
  const sorted = [...keep].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1]! > 1) out.push('gap')
    out.push(n)
  })
  return out
})

const cell =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
</script>

<template>
  <nav v-if="pages > 1" aria-label="Pages">
    <ul class="flex flex-wrap items-center justify-center gap-1">
      <li>
        <NuxtLink
          v-if="page > 1"
          :to="to(page - 1)"
          :class="[cell, 'gap-1 hover:bg-muted']"
          aria-label="Previous page"
        >
          <AppIcon name="chevron-left" :size="18" />
          <span class="hidden sm:inline">Previous</span>
        </NuxtLink>
      </li>
      <li v-for="(item, i) in items" :key="item === 'gap' ? `gap-${i}` : item">
        <span v-if="item === 'gap'" :class="[cell, 'text-muted-foreground']" aria-hidden="true">
          …
        </span>
        <NuxtLink
          v-else
          :to="to(item)"
          :aria-current="item === page ? 'page' : undefined"
          :aria-label="`Page ${item}`"
          :class="[cell, item === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted']"
        >
          {{ item }}
        </NuxtLink>
      </li>
      <li>
        <NuxtLink
          v-if="page < pages"
          :to="to(page + 1)"
          :class="[cell, 'gap-1 hover:bg-muted']"
          aria-label="Next page"
        >
          <span class="hidden sm:inline">Next</span>
          <AppIcon name="chevron-right" :size="18" />
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
