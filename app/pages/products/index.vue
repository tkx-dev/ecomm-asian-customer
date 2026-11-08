<script setup lang="ts">
import type { FacetOption, ProductQuery, ProductSort } from '#shared/types/catalog'
import { listProducts, type MockScenario } from '~/services/catalog'

const route = useRoute()

// Dev only: preview page states with ?mock=loading | error | empty
const scenario = computed<MockScenario>(() => {
  const value = route.query.mock
  return import.meta.dev && (value === 'loading' || value === 'error' || value === 'empty')
    ? value
    : 'ok'
})

// The URL holds every filter, so results can be shared, bookmarked and reached with Back.
// These are this site's own URL names. [TODO: ask] The API's parameter names may differ.
const sorts: { value: ProductSort; label: string }[] = [
  { value: 'relevance', label: 'Best match' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]
const isSort = (v: unknown): v is ProductSort => sorts.some((s) => s.value === v)
const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const amount = (v: unknown) => {
  const n = Number(text(v))
  return text(v) !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined
}

const query = computed<ProductQuery>(() => ({
  q: text(route.query.q),
  category: text(route.query.category),
  brands: text(route.query.brand)?.split(',').filter(Boolean),
  minPrice: amount(route.query.min),
  maxPrice: amount(route.query.max),
  inStockOnly: route.query.stock === 'in' || undefined,
  sort: isSort(route.query.sort) ? route.query.sort : undefined,
  page: Math.max(1, Math.trunc(amount(route.query.page) ?? 1)),
}))

function toRouteQuery(q: ProductQuery) {
  return {
    q: q.q,
    category: q.category,
    brand: q.brands?.length ? q.brands.join(',') : undefined,
    min: q.minPrice?.toString(),
    max: q.maxPrice?.toString(),
    stock: q.inStockOnly ? 'in' : undefined,
    sort: q.sort && q.sort !== 'relevance' ? q.sort : undefined,
    page: q.page && q.page > 1 ? String(q.page) : undefined,
    mock: text(route.query.mock),
  }
}

/** Any filter change goes back to page 1. A new category clears brands that may not exist in it. */
function update(changes: Partial<ProductQuery>) {
  const next = { ...query.value, ...changes, page: changes.page ?? 1 }
  if ('category' in changes && !('brands' in changes)) next.brands = undefined
  return navigateTo({ query: toRouteQuery(next) })
}
const pageLink = (page: number) => ({ query: toRouteQuery({ ...query.value, page }) })
// A new page starts at the top. Filter changes keep the scroll position (the sidebar is in use).
watch(
  () => query.value.page,
  () => window.scrollTo({ top: 0 }),
)

const { data, status, error, refresh } = await useAsyncData(
  () => `products:${scenario.value}:${JSON.stringify(query.value)}`,
  () => listProducts(query.value, scenario.value),
  { lazy: true, server: scenario.value === 'ok' },
)

const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')

// Keep the last filter counts on screen while the next page of results loads.
const facets = ref<{ categories: FacetOption[]; brands: FacetOption[] }>({
  categories: [],
  brands: [],
})
watch(
  data,
  (value) => {
    if (value) facets.value = value.facets
  },
  { immediate: true },
)

const categoryLabel = computed(
  () => facets.value.categories.find((c) => c.value === query.value.category)?.label,
)
const title = computed(() => {
  if (query.value.q) return `Results for “${query.value.q}”`
  return categoryLabel.value ?? (query.value.category ? 'Products' : 'All products')
})

const summary = computed(() => {
  const d = data.value
  if (!d || !d.total) return ''
  const first = (d.page - 1) * d.pageSize + 1
  const last = Math.min(d.page * d.pageSize, d.total)
  return `Showing ${first}–${last} of ${d.total} products`
})

// Chips for every active filter, each with the change that removes it.
const chips = computed(() => {
  const q = query.value
  const list: { label: string; remove: Partial<ProductQuery> }[] = []
  if (q.q) list.push({ label: `“${q.q}”`, remove: { q: undefined } })
  if (q.category)
    list.push({ label: categoryLabel.value ?? q.category, remove: { category: undefined } })
  for (const b of q.brands ?? [])
    list.push({ label: b, remove: { brands: q.brands!.filter((x) => x !== b) } })
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    const lo = q.minPrice !== undefined ? `$${q.minPrice}` : 'Any'
    const hi = q.maxPrice !== undefined ? `$${q.maxPrice}` : 'any'
    list.push({ label: `${lo} to ${hi}`, remove: { minPrice: undefined, maxPrice: undefined } })
  }
  if (q.inStockOnly) list.push({ label: 'In stock', remove: { inStockOnly: undefined } })
  return list
})
// Filters only; the search words stay when filters are cleared.
const filterCount = computed(() => chips.value.filter((c) => !('q' in c.remove)).length)
const clearFilters = () =>
  update({
    category: undefined,
    brands: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    inStockOnly: undefined,
  })

// Mobile filter sheet. <dialog> gives focus trapping and Esc for free.
const sheet = ref<HTMLDialogElement>()
function openSheet() {
  sheet.value?.showModal()
  document.documentElement.style.overflow = 'hidden'
}
function closeSheet() {
  sheet.value?.close()
}
function onSheetClose() {
  document.documentElement.style.overflow = ''
}
onBeforeUnmount(onSheetClose)

useSeoMeta({
  title: () => `${title.value} | InfinityShop`,
  description: 'Browse products and pay with cryptocurrency.',
})

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
const chipClass =
  'inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
</script>

<template>
  <div :class="[container, 'py-6 lg:py-10']">
    <nav aria-label="Breadcrumb" class="mb-4 hidden lg:block">
      <ol class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <NuxtLink
            to="/"
            class="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            Home
          </NuxtLink>
        </li>
        <li aria-hidden="true"><AppIcon name="chevron-right" :size="14" /></li>
        <li v-if="query.category && categoryLabel">
          <NuxtLink
            to="/products"
            class="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            Products
          </NuxtLink>
        </li>
        <li v-if="query.category && categoryLabel" aria-hidden="true">
          <AppIcon name="chevron-right" :size="14" />
        </li>
        <li aria-current="page" class="text-foreground">
          {{ query.category && categoryLabel ? categoryLabel : 'Products' }}
        </li>
      </ol>
    </nav>

    <header>
      <h1 class="text-2xl font-semibold tracking-tight lg:text-3xl">{{ title }}</h1>
      <p class="mt-1 min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {{ isLoading ? 'Loading products' : summary }}
      </p>
    </header>

    <!-- Mobile: categories as chips, like a shopping app -->
    <ul class="-mx-4 mt-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
      <li>
        <button
          type="button"
          :class="[
            chipClass,
            !query.category
              ? 'border-primary bg-primary text-primary-foreground'
              : 'hover:bg-muted',
          ]"
          :aria-pressed="!query.category"
          @click="update({ category: undefined })"
        >
          All
        </button>
      </li>
      <li v-for="c in facets.categories" :key="c.value">
        <button
          type="button"
          :class="[
            chipClass,
            query.category === c.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'hover:bg-muted',
          ]"
          :aria-pressed="query.category === c.value"
          @click="update({ category: c.value })"
        >
          {{ c.label }}
        </button>
      </li>
    </ul>

    <div class="mt-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <!-- Desktop filters -->
      <aside class="hidden lg:block" aria-label="Filters">
        <div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-6">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-semibold">Filters</h2>
            <button
              v-if="filterCount"
              type="button"
              class="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              @click="clearFilters"
            >
              Clear all
            </button>
          </div>
          <ProductFilterPanel
            id-prefix="side"
            :query="query"
            :categories="facets.categories"
            :brands="facets.brands"
            @change="update"
          />
        </div>
      </aside>

      <div class="min-w-0">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-3 border-b pb-4">
          <button
            type="button"
            class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
            aria-haspopup="dialog"
            @click="openSheet"
          >
            <AppIcon name="sliders" :size="18" />
            Filters
            <span
              v-if="filterCount"
              class="min-w-5 rounded-full bg-primary px-1.5 text-xs leading-5 text-primary-foreground"
            >
              {{ filterCount }}
            </span>
          </button>

          <ul
            v-if="chips.length"
            class="hidden flex-wrap gap-2 lg:flex"
            aria-label="Active filters"
          >
            <li v-for="chip in chips" :key="chip.label">
              <button
                type="button"
                :class="[chipClass, 'bg-muted hover:border-primary']"
                :aria-label="`Remove filter ${chip.label}`"
                @click="update(chip.remove)"
              >
                {{ chip.label }}
                <AppIcon name="close" :size="14" />
              </button>
            </li>
          </ul>

          <div class="ml-auto flex items-center gap-2">
            <label for="sort" class="text-sm whitespace-nowrap text-muted-foreground"
              >Sort by</label
            >
            <select
              id="sort"
              :value="query.sort ?? 'relevance'"
              class="h-11 cursor-pointer rounded-full border border-input bg-background px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring"
              @change="update({ sort: ($event.target as HTMLSelectElement).value as ProductSort })"
            >
              <option v-for="s in sorts" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>

        <!-- Error -->
        <div v-if="status === 'error'" class="py-20 text-center" aria-live="polite">
          <h2 class="text-xl font-semibold">Products could not be loaded</h2>
          <p class="mx-auto mt-2 max-w-md text-muted-foreground">
            {{ error?.message || 'The store did not respond.' }} Check your connection and try
            again.
          </p>
          <button
            type="button"
            class="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            @click="() => refresh()"
          >
            <AppIcon name="refresh" :size="18" />
            Try again
          </button>
        </div>

        <!-- Empty -->
        <div v-else-if="!isLoading && !data?.total" class="py-20 text-center">
          <AppIcon name="search" :size="40" class="mx-auto text-muted-foreground" />
          <h2 class="mt-4 text-xl font-semibold">No products found</h2>
          <p class="mx-auto mt-2 max-w-md text-muted-foreground">
            {{
              filterCount || query.q
                ? 'Nothing matches these filters. Remove some filters or try other words.'
                : 'New products appear here as soon as they are added.'
            }}
          </p>
          <button
            v-if="filterCount"
            type="button"
            class="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-full border px-6 font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            @click="clearFilters"
          >
            Clear all filters
          </button>
        </div>

        <!-- Results (and loading skeleton) -->
        <template v-else>
          <ProductGrid
            class="mt-6"
            :products="data?.items"
            :loading="isLoading"
            :skeleton-count="9"
            :columns="3"
            :aria-busy="isLoading"
          />
          <ProductPagination
            v-if="data && !isLoading"
            class="mt-12"
            :page="data.page"
            :total="data.total"
            :page-size="data.pageSize"
            :to="pageLink"
          />
        </template>
      </div>
    </div>

    <!-- Mobile filter sheet -->
    <dialog
      ref="sheet"
      aria-labelledby="sheet-title"
      class="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-2xl bg-background p-0 text-foreground backdrop:bg-black/50 lg:hidden"
      @close="onSheetClose"
      @click.self="closeSheet"
    >
      <div class="flex max-h-[85dvh] flex-col">
        <div class="flex items-center justify-between border-b px-4 py-3">
          <h2 id="sheet-title" class="text-lg font-semibold">Filters</h2>
          <button
            type="button"
            class="inline-flex size-11 cursor-pointer items-center justify-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Close filters"
            @click="closeSheet"
          >
            <AppIcon name="close" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-5">
          <ProductFilterPanel
            id-prefix="sheet"
            :query="query"
            :categories="facets.categories"
            :brands="facets.brands"
            @change="update"
          />
        </div>
        <div class="flex gap-3 border-t px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            :disabled="!filterCount"
            class="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-full border font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
            @click="clearFilters"
          >
            Clear all
          </button>
          <button
            type="button"
            class="inline-flex min-h-12 flex-[2] cursor-pointer items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            @click="closeSheet"
          >
            <AppIcon
              v-if="isLoading"
              name="spinner"
              :size="18"
              class="animate-spin motion-reduce:animate-none"
            />
            {{ isLoading ? 'Updating' : `Show ${data?.total ?? 0} products` }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>
