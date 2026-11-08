// Dev-only dummy data. Never imported in production builds (see ../catalog.ts).
import type { Category, HeroSlide, HomeData, Product } from '#shared/types/catalog'

export type MockScenario = 'ok' | 'loading' | 'error' | 'empty'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Product photos and names from DummyJSON (https://dummyjson.com), a public test-data API.
// Book covers from Open Library (https://openlibrary.org/dev/docs/api/covers).
// Dev mock only: the real catalog API supplies its own images. [TODO: ask] Image host and sizes.
const dummy = (category: string, slug: string, file = '1.webp') =>
  `https://cdn.dummyjson.com/product-images/${category}/${encodeURIComponent(slug)}/${file}`
const bookCover = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

const categories: Category[] = [
  {
    slug: 'electronics',
    name: 'Electronics',
    imageUrl: dummy('smartphones', 'iphone-13-pro', 'thumbnail.webp'),
    productCount: 48,
  },
  {
    slug: 'home-kitchen',
    name: 'Home & kitchen',
    imageUrl: dummy('kitchen-accessories', 'silver-pot-with-glass-cap', 'thumbnail.webp'),
    productCount: 36,
  },
  {
    slug: 'fashion',
    name: 'Fashion',
    imageUrl: dummy('womens-bags', 'women-handbag-black', 'thumbnail.webp'),
    productCount: 64,
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    imageUrl: dummy('beauty', 'red-lipstick', 'thumbnail.webp'),
    productCount: 22,
  },
  {
    slug: 'sports-outdoors',
    name: 'Sports & outdoors',
    imageUrl: dummy('sports-accessories', 'football', 'thumbnail.webp'),
    productCount: 30,
  },
  { slug: 'books', name: 'Books', imageUrl: bookCover('9780735211292'), productCount: 51 },
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
  imageUrl: string,
  inStock = true,
): Product => ({
  id,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name,
  category: cat(category),
  price: { amount, currency: 'USD' },
  imageUrl,
  inStock,
})

const featured: Product[] = [
  product(
    'p01',
    'Apple AirPods Max Silver',
    'electronics',
    549.99,
    dummy('mobile-accessories', 'apple-airpods-max-silver'),
  ),
  product(
    'p02',
    'Boxed Blender',
    'home-kitchen',
    39.99,
    dummy('kitchen-accessories', 'boxed-blender'),
  ),
  product(
    'p03',
    "Heshe Women's Leather Bag",
    'fashion',
    129.99,
    dummy('womens-bags', "heshe-women's-leather-bag"),
  ),
  product(
    'p04',
    'Volleyball',
    'sports-outdoors',
    11.99,
    dummy('sports-accessories', 'volleyball'),
    false,
  ),
]

const newArrivals: Product[] = [
  product(
    'p05',
    'Apple MacBook Pro 14 Inch Space Grey',
    'electronics',
    1999.99,
    dummy('laptops', 'apple-macbook-pro-14-inch-space-grey'),
  ),
  product(
    'p06',
    'Carbon Steel Wok',
    'home-kitchen',
    29.99,
    dummy('kitchen-accessories', 'carbon-steel-wok'),
  ),
  product(
    'p07',
    'Puma Future Rider Trainers',
    'fashion',
    89.99,
    dummy('mens-shoes', 'puma-future-rider-trainers'),
  ),
  product(
    'p08',
    'Eyeshadow Palette with Mirror',
    'beauty',
    19.99,
    dummy('beauty', 'eyeshadow-palette-with-mirror'),
  ),
  product('p09', 'Basketball', 'sports-outdoors', 14.99, dummy('sports-accessories', 'basketball')),
  // Open Library has no prices. This one is a placeholder like every mock price.
  product('p10', 'The Design of Everyday Things', 'books', 18.5, bookCover('9780465050659')),
  product(
    'p11',
    'Samsung Galaxy S8',
    'electronics',
    499.99,
    dummy('smartphones', 'samsung-galaxy-s8'),
    false,
  ),
  product('p12', 'Table Lamp', 'home-kitchen', 49.99, dummy('home-decoration', 'table-lamp')),
]

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
