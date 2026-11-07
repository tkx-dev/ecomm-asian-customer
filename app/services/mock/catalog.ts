// Dev-only dummy data. Never imported in production builds (see ../catalog.ts).
import type { Category, HomeData, Product } from '#shared/types/catalog'

export type MockScenario = 'ok' | 'loading' | 'error' | 'empty'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const photo = (seed: string) => `https://picsum.photos/seed/infinity-${seed}/600/600`

const categories: Category[] = [
  { slug: 'electronics', name: 'Electronics', imageUrl: photo('electronics'), productCount: 48 },
  { slug: 'home-kitchen', name: 'Home & kitchen', imageUrl: photo('kitchen'), productCount: 36 },
  { slug: 'fashion', name: 'Fashion', imageUrl: photo('fashion'), productCount: 64 },
  { slug: 'beauty', name: 'Beauty', imageUrl: photo('beauty'), productCount: 22 },
  {
    slug: 'sports-outdoors',
    name: 'Sports & outdoors',
    imageUrl: photo('outdoors'),
    productCount: 30,
  },
  { slug: 'books', name: 'Books', imageUrl: photo('books'), productCount: 51 },
]

const cat = (slug: string) => {
  const found = categories.find((c) => c.slug === slug)!
  return { slug: found.slug, name: found.name }
}

const product = (
  id: string,
  name: string,
  category: string,
  amount: number,
  inStock = true,
): Product => ({
  id,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name,
  category: cat(category),
  price: { amount, currency: 'USD' },
  imageUrl: photo(id),
  inStock,
})

const featured: Product[] = [
  product('p01', 'Wireless noise-cancelling headphones', 'electronics', 189),
  product('p02', 'Ceramic pour-over coffee set', 'home-kitchen', 42.5),
  product('p03', 'Waxed canvas weekender bag', 'fashion', 128),
  product('p04', 'Ultralight trail running jacket', 'sports-outdoors', 96, false),
]

const newArrivals: Product[] = [
  product('p05', 'Mechanical keyboard, 75% layout', 'electronics', 149),
  product('p06', 'Cast iron skillet, 10 inch', 'home-kitchen', 39.99),
  product('p07', 'Merino crew-neck sweater', 'fashion', 84),
  product('p08', 'Vitamin C brightening serum', 'beauty', 27),
  product('p09', 'Insulated steel water bottle', 'sports-outdoors', 24.95),
  product('p10', 'The design of everyday things', 'books', 18.5),
  product('p11', 'Smart LED desk lamp', 'electronics', 59, false),
  product('p12', 'Linen bed sheet set, queen', 'home-kitchen', 112),
]

export async function mockHomeData(scenario: MockScenario): Promise<HomeData> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(500)
  if (scenario === 'error') throw new Error('The catalog service did not respond (mock error).')
  if (scenario === 'empty') return { categories: [], featured: [], newArrivals: [] }
  return { categories, featured, newArrivals }
}
