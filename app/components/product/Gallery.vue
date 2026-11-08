<script setup lang="ts">
// Swipeable image gallery: scroll-snap track, counter, arrows (desktop) and thumbnails.
const props = defineProps<{ images: string[]; name: string; dimmed?: boolean }>()

const track = ref<HTMLElement>()
const active = ref(0)

function onScroll() {
  const el = track.value
  if (el?.clientWidth) active.value = Math.round(el.scrollLeft / el.clientWidth)
}

function show(index: number) {
  const el = track.value
  if (!el) return
  const i = Math.min(Math.max(index, 0), props.images.length - 1)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' })
  active.value = i
}

// A new product (related product link) reuses this component: go back to the first image.
watch(
  () => props.images,
  () => {
    active.value = 0
    track.value?.scrollTo({ left: 0 })
  },
)

const arrow =
  'absolute top-1/2 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-opacity hover:bg-background focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-0 lg:inline-flex'
</script>

<template>
  <div>
    <div class="relative">
      <ul
        ref="track"
        class="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto bg-muted lg:rounded-xl [&::-webkit-scrollbar]:hidden"
        :aria-label="`${name} images`"
        @scroll.passive="onScroll"
      >
        <li
          v-for="(src, i) in images"
          :key="src"
          class="aspect-square w-full shrink-0 snap-center"
          :aria-hidden="i !== active ? 'true' : undefined"
        >
          <img
            :src="src"
            :alt="i === 0 ? name : `${name}, image ${i + 1}`"
            width="1000"
            height="1000"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : undefined"
            class="size-full object-contain p-6 sm:p-10"
            :class="{ 'opacity-60 grayscale': dimmed }"
          />
        </li>
      </ul>

      <template v-if="images.length > 1">
        <button
          type="button"
          :class="[arrow, 'left-3']"
          :disabled="active === 0"
          aria-label="Previous image"
          @click="show(active - 1)"
        >
          <AppIcon name="chevron-left" />
        </button>
        <button
          type="button"
          :class="[arrow, 'right-3']"
          :disabled="active === images.length - 1"
          aria-label="Next image"
          @click="show(active + 1)"
        >
          <AppIcon name="chevron-right" />
        </button>
        <span
          class="absolute right-3 bottom-3 rounded-full bg-foreground/70 px-2.5 py-0.5 text-xs font-medium text-background tabular-nums lg:hidden"
          aria-hidden="true"
        >
          {{ active + 1 }} / {{ images.length }}
        </span>
      </template>
    </div>

    <ul v-if="images.length > 1" class="mt-3 flex gap-2 overflow-x-auto px-4 lg:px-0">
      <li v-for="(src, i) in images" :key="src" class="shrink-0">
        <button
          type="button"
          :aria-label="`Show image ${i + 1} of ${images.length}`"
          :aria-current="i === active ? 'true' : undefined"
          :class="[
            'block size-16 cursor-pointer overflow-hidden rounded-lg border-2 bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            i === active ? 'border-primary' : 'border-transparent hover:border-border',
          ]"
          @click="show(i)"
        >
          <img :src="src" alt="" width="64" height="64" class="size-full object-contain p-1" />
        </button>
      </li>
    </ul>
  </div>
</template>
