// Dev-only dummy data. Never imported in production builds (see ../catalog.ts).
// Products come from ./catalogData.ts (DummyJSON + Open Library). This file plays the backend:
// it filters, sorts, counts and pages so the UI can be built before the API exists.
import type {
  Category,
  FacetOption,
  HeroSlide,
  HomeData,
  Product,
  ProductDetail,
  ProductListResult,
  ProductPageData,
  ProductQuery,
} from '#shared/types/catalog'
import { productRows, type MockProductRow } from './catalogData'

export type MockScenario = 'ok' | 'loading' | 'error' | 'empty'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const PAGE_SIZE = 24

const categoryInfo = [
  { slug: 'electronics', name: 'Electronics', image: 'd123' },
  { slug: 'home-kitchen', name: 'Home & kitchen', image: 'd71' },
  { slug: 'fashion', name: 'Fashion', image: 'd176' },
  { slug: 'beauty', name: 'Beauty', image: 'd4' },
  { slug: 'sports-outdoors', name: 'Sports & outdoors', image: 'd147' },
  { slug: 'books', name: 'Books', image: 'b9780735211292' },
]
const categoryName = (slug: string) => categoryInfo.find((c) => c.slug === slug)?.name ?? slug

function toDetail(row: MockProductRow): ProductDetail {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: { slug: row.category, name: categoryName(row.category) },
    price: { amount: row.amount, currency: 'USD' },
    imageUrl: row.images[0]!,
    inStock: row.stock > 0,
    brand: row.brand,
    sku: row.sku,
    description: row.description,
    images: row.images,
    stock: row.stock,
    shippingNote: row.shippingNote,
    warranty: row.warranty,
    specs: row.specs.map(([label, value]) => ({ label, value })),
  }
}

const products = productRows.map(toDetail)
const byId = (id: string) => products.find((p) => p.id === id)!

// Only the card fields, as a list endpoint would send them.
const toCard = (p: ProductDetail): Product => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  price: p.price,
  imageUrl: p.imageUrl,
  inStock: p.inStock,
})

const categories: Category[] = categoryInfo.map((c) => ({
  slug: c.slug,
  name: c.name,
  imageUrl: byId(c.image).imageUrl,
  productCount: products.filter((p) => p.category.slug === c.slug).length,
}))

const featured = ['d101', 'd51', 'd173', 'd153'].map((id) => toCard(byId(id)))
const newArrivals = ['d78', 'd52', 'd90', 'd2', 'd140', 'b9780465050659', 'd132', 'd47'].map((id) =>
  toCard(byId(id)),
)

const heroSlides: HeroSlide[] = [
  {
    id: 'welcome',
    title: 'Shop everything. Pay with crypto.',
    description:
      'Electronics, home goods, fashion and more. Check out from your crypto wallet and follow every order until it reaches your door.',
    imageUrl: `https://picsum.photos/seed/infinity-hero-welcome/1200/900`,
    cta: { label: 'Browse products', to: '/products' },
  },
  {
    id: 'electronics',
    title: 'Sound and tech for every desk',
    description:
      'Headphones, mechanical keyboards and smart lamps, picked for everyday use and shipped with tracking.',
    imageUrl: `https://picsum.photos/seed/infinity-hero-electronics/1200/900`,
    cta: { label: 'Shop electronics', to: '/products?category=electronics' },
  },
  {
    id: 'home-kitchen',
    title: 'A kitchen you want to cook in',
    description:
      'Cast iron, pour-over sets and linen for the rest of the house. Prices shown in USD, paid in crypto.',
    imageUrl: `https://picsum.photos/seed/infinity-hero-kitchen/1200/900`,
    cta: { label: 'Shop home & kitchen', to: '/products?category=home-kitchen' },
  },
  {
    id: 'tracking',
    title: 'From wallet to doorstep',
    description:
      'Your order updates the moment payment confirms. Follow it to delivery with its tracking number.',
    imageUrl: `https://picsum.photos/seed/infinity-hero-tracking/1200/900`,
    cta: { label: 'How crypto checkout works', to: '/#how-it-works' },
  },
]

export async function mockHomeData(scenario: MockScenario): Promise<HomeData> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(500)
  if (scenario === 'error') throw new Error('The catalog service did not respond (mock error).')
  if (scenario === 'empty') return { heroSlides: [], categories: [], featured: [], newArrivals: [] }
  return { heroSlides, categories, featured, newArrivals }
}

export async function mockProductPage(
  slug: string,
  scenario: MockScenario,
): Promise<ProductPageData | null> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(500)
  if (scenario === 'error') throw new Error('The catalog service did not respond (mock error).')
  const product = products.find((p) => p.slug === slug)
  // ?mock=empty previews the "product not found" state.
  if (scenario === 'empty' || !product) return null
  const others = products.filter((p) => p.id !== product.id && p.inStock)
  const related = others.filter((p) => p.category.slug === product.category.slug).slice(0, 4)
  return { product, related: related.map(toCard) }
}

function facet(values: string[], label: (value: string) => string): FacetOption[] {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts]
    .map(([value, count]) => ({ value, label: label(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export async function mockListProducts(
  query: ProductQuery,
  scenario: MockScenario,
): Promise<ProductListResult> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(450)
  if (scenario === 'error') throw new Error('The catalog service did not respond (mock error).')
  const empty = { categories: [], brands: [] }
  if (scenario === 'empty')
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, facets: empty }

  const words = (query.q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const matchesText = (p: ProductDetail) => {
    const text = `${p.name} ${p.brand ?? ''} ${p.category.name}`.toLowerCase()
    return words.every((w) => text.includes(w))
  }
  const matchesPrice = (p: ProductDetail) =>
    (query.minPrice === undefined || p.price.amount >= query.minPrice) &&
    (query.maxPrice === undefined || p.price.amount <= query.maxPrice) &&
    (!query.inStockOnly || p.inStock)

  // Facets count with the search, price and stock filters applied.
  const base = products.filter((p) => matchesText(p) && matchesPrice(p))
  const inCategory = base.filter((p) => !query.category || p.category.slug === query.category)
  const brands = query.brands ?? []
  const results = inCategory.filter((p) => !brands.length || brands.includes(p.brand ?? ''))

  if (query.sort === 'price-asc') results.sort((a, b) => a.price.amount - b.price.amount)
  if (query.sort === 'price-desc') results.sort((a, b) => b.price.amount - a.price.amount)

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const page = Math.min(Math.max(query.page ?? 1, 1), pages)
  return {
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toCard),
    total: results.length,
    page,
    pageSize: PAGE_SIZE,
    facets: {
      // Brands are cleared when the category changes, so category counts ignore brands.
      categories: facet(
        base.map((p) => p.category.slug),
        categoryName,
      ),
      brands: facet(
        inCategory.flatMap((p) => (p.brand ? [p.brand] : [])),
        (v) => v,
      ),
    },
  }
}
