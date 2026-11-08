<script setup lang="ts">
import type { FacetOption, ProductQuery } from '#shared/types/catalog'

// Filter groups for the product listing. Used in the desktop sidebar and the mobile sheet.
// Emits the changed fields only; the page writes them to the URL.
const props = defineProps<{
  idPrefix: string
  query: ProductQuery
  categories: FacetOption[]
  brands: FacetOption[]
}>()
const emit = defineEmits<{ change: [changes: Partial<ProductQuery>] }>()

const BRANDS_SHOWN = 8
const showAllBrands = ref(false)
const visibleBrands = computed(() => {
  const list = showAllBrands.value ? props.brands : props.brands.slice(0, BRANDS_SHOWN)
  // Keep selected brands visible even when the list is collapsed.
  const picked = props.brands.filter(
    (b) => props.query.brands?.includes(b.value) && !list.includes(b),
  )
  return [...list, ...picked]
})

function toggleBrand(value: string, checked: boolean) {
  const current = props.query.brands ?? []
  emit('change', {
    brands: checked ? [...current, value] : current.filter((b) => b !== value),
  })
}

// Price inputs apply on the button (or Enter), not on every keystroke.
const min = ref('')
const max = ref('')
const priceError = ref('')
watch(
  () => [props.query.minPrice, props.query.maxPrice],
  ([lo, hi]) => {
    min.value = lo === undefined ? '' : String(lo)
    max.value = hi === undefined ? '' : String(hi)
  },
  { immediate: true },
)

function applyPrice() {
  const parse = (v: string) => (v.trim() === '' ? undefined : Number(v))
  const lo = parse(min.value)
  const hi = parse(max.value)
  if ([lo, hi].some((n) => n !== undefined && (!Number.isFinite(n) || n < 0))) {
    priceError.value = 'Enter prices as positive numbers.'
    return
  }
  if (lo !== undefined && hi !== undefined && lo > hi) {
    priceError.value = 'Min price must not be more than max price.'
    return
  }
  priceError.value = ''
  emit('change', { minPrice: lo, maxPrice: hi })
}

const groupTitle = 'text-sm font-semibold'
const optionRow =
  'flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-muted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring'
const control = 'size-4 shrink-0 cursor-pointer accent-primary'
</script>

<template>
  <div class="divide-y">
    <!-- Category -->
    <div class="pb-5">
      <fieldset>
        <legend :class="[groupTitle, 'mb-2']">Category</legend>
        <label :class="optionRow">
          <input
            type="radio"
            :name="`${idPrefix}-category`"
            :class="control"
            :checked="!query.category"
            @change="emit('change', { category: undefined })"
          />
          <span class="flex-1">All categories</span>
        </label>
        <label v-for="c in categories" :key="c.value" :class="optionRow">
          <input
            type="radio"
            :name="`${idPrefix}-category`"
            :class="control"
            :checked="query.category === c.value"
            @change="emit('change', { category: c.value })"
          />
          <span class="flex-1">{{ c.label }}</span>
          <span class="text-xs text-muted-foreground tabular-nums">{{ c.count }}</span>
        </label>
      </fieldset>
    </div>

    <!-- Brand -->
    <div v-if="brands.length" class="py-5">
      <fieldset>
        <legend :class="[groupTitle, 'mb-2']">Brand</legend>
        <div>
          <label v-for="b in visibleBrands" :key="b.value" :class="optionRow">
            <input
              type="checkbox"
              :class="control"
              :checked="query.brands?.includes(b.value) ?? false"
              @change="toggleBrand(b.value, ($event.target as HTMLInputElement).checked)"
            />
            <span class="flex-1">{{ b.label }}</span>
            <span class="text-xs text-muted-foreground tabular-nums">{{ b.count }}</span>
          </label>
        </div>
        <button
          v-if="brands.length > BRANDS_SHOWN"
          type="button"
          class="mt-1 inline-flex min-h-10 cursor-pointer items-center rounded-md px-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          :aria-expanded="showAllBrands"
          @click="showAllBrands = !showAllBrands"
        >
          {{ showAllBrands ? 'Show fewer brands' : `Show all ${brands.length} brands` }}
        </button>
      </fieldset>
    </div>

    <!-- Price -->
    <div class="py-5">
      <fieldset>
        <legend :class="[groupTitle, 'mb-3']">Price (USD)</legend>
        <form class="flex items-end gap-2" novalidate @submit.prevent="applyPrice">
          <label class="min-w-0 flex-1">
            <span class="sr-only">Minimum price</span>
            <input
              :id="`${idPrefix}-min`"
              v-model="min"
              type="text"
              inputmode="decimal"
              placeholder="Min"
              :aria-invalid="priceError ? 'true' : undefined"
              :aria-describedby="priceError ? `${idPrefix}-price-error` : undefined"
              class="h-10 w-full rounded-lg border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring sm:text-sm"
            />
          </label>
          <span class="pb-2.5 text-muted-foreground" aria-hidden="true">–</span>
          <label class="min-w-0 flex-1">
            <span class="sr-only">Maximum price</span>
            <input
              :id="`${idPrefix}-max`"
              v-model="max"
              type="text"
              inputmode="decimal"
              placeholder="Max"
              :aria-invalid="priceError ? 'true' : undefined"
              :aria-describedby="priceError ? `${idPrefix}-price-error` : undefined"
              class="h-10 w-full rounded-lg border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring sm:text-sm"
            />
          </label>
          <button
            type="submit"
            class="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Apply
          </button>
        </form>
        <p v-if="priceError" :id="`${idPrefix}-price-error`" class="mt-2 text-sm text-destructive">
          {{ priceError }}
        </p>
      </fieldset>
    </div>

    <!-- Availability -->
    <div class="pt-5">
      <fieldset>
        <legend :class="[groupTitle, 'mb-2']">Availability</legend>
        <label :class="optionRow">
          <input
            type="checkbox"
            :class="control"
            :checked="!!query.inStockOnly"
            @change="
              emit('change', {
                inStockOnly: ($event.target as HTMLInputElement).checked || undefined,
              })
            "
          />
          <span>In stock only</span>
        </label>
      </fieldset>
    </div>
  </div>
</template>
