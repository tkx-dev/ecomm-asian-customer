// Dev-only dummy data. Never imported in production builds (see ../catalog.ts).
import type {
  Category,
  HeroSlide,
  HomeData,
  Product,
  ProductDetail,
  ProductPageData,
} from '#shared/types/catalog'

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

// Product page extras, keyed by product id. Copied from DummyJSON (weight and size units assumed).
type DetailExtras = Omit<ProductDetail, keyof Product>
const details: Record<string, DetailExtras> = {
  p01: {
    brand: 'Apple',
    sku: 'MOB-APP-APP-101',
    description:
      'The Apple AirPods Max in Silver are premium over-ear headphones with high-fidelity audio, adaptive EQ, and active noise cancellation. Experience immersive sound in style.',
    images: [
      'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp',
    ],
    stock: 59,
    shippingNote: 'Ships in 2 weeks',
    warranty: 'No warranty',
    specs: [
      { label: 'Brand', value: 'Apple' },
      { label: 'SKU', value: 'MOB-APP-APP-101' },
      { label: 'Weight', value: '2 kg' },
      { label: 'Dimensions (W × H × D)', value: '24.88 × 14.9 × 27.54 cm' },
      { label: 'Warranty', value: 'No warranty' },
    ],
  },
  p02: {
    brand: null,
    sku: 'KIT-BRD-BOX-051',
    description:
      'The Boxed Blender is a powerful and compact blender perfect for smoothies, shakes, and more. Its convenient design and multiple functions make it a versatile kitchen appliance.',
    images: [
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/1.webp',
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/2.webp',
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/3.webp',
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/4.webp',
    ],
    stock: 9,
    shippingNote: 'Ships in 1-2 business days',
    warranty: '5 year warranty',
    specs: [
      { label: 'Brand', value: 'Unbranded' },
      { label: 'SKU', value: 'KIT-BRD-BOX-051' },
      { label: 'Weight', value: '1 kg' },
      { label: 'Dimensions (W × H × D)', value: '9.05 × 19.45 × 17.59 cm' },
      { label: 'Warranty', value: '5 year warranty' },
    ],
  },
  p03: {
    brand: 'Heshe',
    sku: 'WOM-HES-HES-173',
    description:
      "The Heshe Women's Leather Bag is a luxurious and high-quality leather bag for the sophisticated woman. With a timeless design and durable craftsmanship, it's a versatile accessory.",
    images: [
      "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/3.webp",
    ],
    stock: 99,
    shippingNote: 'Ships overnight',
    warranty: '5 year warranty',
    specs: [
      { label: 'Brand', value: 'Heshe' },
      { label: 'SKU', value: 'WOM-HES-HES-173' },
      { label: 'Weight', value: '3 kg' },
      { label: 'Dimensions (W × H × D)', value: '28.66 × 20.56 × 6.62 cm' },
      { label: 'Warranty', value: '5 year warranty' },
    ],
  },
  p04: {
    brand: null,
    sku: 'SPO-BRD-VOL-153',
    description:
      'The Volleyball is a standard ball used in the sport of volleyball. It is designed for passing, setting, and spiking over the net during volleyball matches.',
    images: ['https://cdn.dummyjson.com/product-images/sports-accessories/volleyball/1.webp'],
    stock: 0,
    shippingNote: 'Ships in 1 week',
    warranty: '1 week warranty',
    specs: [
      { label: 'Brand', value: 'Unbranded' },
      { label: 'SKU', value: 'SPO-BRD-VOL-153' },
      { label: 'Weight', value: '3 kg' },
      { label: 'Dimensions (W × H × D)', value: '17.01 × 20.05 × 9.94 cm' },
      { label: 'Warranty', value: '1 week warranty' },
    ],
  },
  p05: {
    brand: 'Apple',
    sku: 'LAP-APP-APP-078',
    description:
      "The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple's M1 Pro chip for exceptional performance and a stunning Retina display.",
    images: [
      'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp',
      'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/2.webp',
      'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/3.webp',
    ],
    stock: 24,
    shippingNote: 'Ships in 2 weeks',
    warranty: '3 year warranty',
    specs: [
      { label: 'Brand', value: 'Apple' },
      { label: 'SKU', value: 'LAP-APP-APP-078' },
      { label: 'Weight', value: '9 kg' },
      { label: 'Dimensions (W × H × D)', value: '20.03 × 9.54 × 14.82 cm' },
      { label: 'Warranty', value: '3 year warranty' },
    ],
  },
  p06: {
    brand: null,
    sku: 'KIT-BRD-CAR-052',
    description:
      'The Carbon Steel Wok is a versatile cooking pan suitable for stir-frying, sautéing, and deep frying. Its sturdy construction ensures even heat distribution for delicious meals.',
    images: [
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/1.webp',
    ],
    stock: 40,
    shippingNote: 'Ships in 1-2 business days',
    warranty: '2 year warranty',
    specs: [
      { label: 'Brand', value: 'Unbranded' },
      { label: 'SKU', value: 'KIT-BRD-CAR-052' },
      { label: 'Weight', value: '2 kg' },
      { label: 'Dimensions (W × H × D)', value: '27.69 × 7.54 × 10.11 cm' },
      { label: 'Warranty', value: '2 year warranty' },
    ],
  },
  p07: {
    brand: 'Puma',
    sku: 'MEN-PUM-PUM-090',
    description:
      'The Puma Future Rider Trainers offer a blend of retro style and modern comfort. Perfect for casual wear, these trainers provide a fashionable and comfortable option for everyday use.',
    images: [
      'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/1.webp',
      'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/2.webp',
      'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/3.webp',
      'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/4.webp',
    ],
    stock: 90,
    shippingNote: 'Ships in 1-2 business days',
    warranty: '5 year warranty',
    specs: [
      { label: 'Brand', value: 'Puma' },
      { label: 'SKU', value: 'MEN-PUM-PUM-090' },
      { label: 'Weight', value: '6 kg' },
      { label: 'Dimensions (W × H × D)', value: '17.45 × 15.58 × 23.13 cm' },
      { label: 'Warranty', value: '5 year warranty' },
    ],
  },
  p08: {
    brand: 'Glamour Beauty',
    sku: 'BEA-GLA-EYE-002',
    description:
      "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.",
    images: [
      'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp',
    ],
    stock: 34,
    shippingNote: 'Ships in 2 weeks',
    warranty: '1 year warranty',
    specs: [
      { label: 'Brand', value: 'Glamour Beauty' },
      { label: 'SKU', value: 'BEA-GLA-EYE-002' },
      { label: 'Weight', value: '9 kg' },
      { label: 'Dimensions (W × H × D)', value: '9.26 × 22.47 × 27.67 cm' },
      { label: 'Warranty', value: '1 year warranty' },
    ],
  },
  p09: {
    brand: null,
    sku: 'SPO-BRD-BAS-140',
    description:
      'The Basketball is a standard ball used in basketball games. It is designed for dribbling, shooting, and passing in the game of basketball, suitable for both indoor and outdoor play.',
    images: ['https://cdn.dummyjson.com/product-images/sports-accessories/basketball/1.webp'],
    stock: 75,
    shippingNote: 'Ships in 1 week',
    warranty: '1 year warranty',
    specs: [
      { label: 'Brand', value: 'Unbranded' },
      { label: 'SKU', value: 'SPO-BRD-BAS-140' },
      { label: 'Weight', value: '7 kg' },
      { label: 'Dimensions (W × H × D)', value: '27.86 × 10.64 × 18.75 cm' },
      { label: 'Warranty', value: '1 year warranty' },
    ],
  },
  p11: {
    brand: 'Samsung',
    sku: 'SMA-SAM-SAM-132',
    description:
      'The Samsung Galaxy S8 is a premium smartphone with an Infinity Display, offering a stunning visual experience. It boasts advanced camera capabilities and cutting-edge technology.',
    images: [
      'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/1.webp',
      'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/2.webp',
      'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/3.webp',
    ],
    stock: 0,
    shippingNote: 'Ships in 1 week',
    warranty: '2 year warranty',
    specs: [
      { label: 'Brand', value: 'Samsung' },
      { label: 'SKU', value: 'SMA-SAM-SAM-132' },
      { label: 'Weight', value: '6 kg' },
      { label: 'Dimensions (W × H × D)', value: '23.05 × 26.88 × 15.73 cm' },
      { label: 'Warranty', value: '2 year warranty' },
    ],
  },
  p12: {
    brand: null,
    sku: 'HOM-BRD-TAB-047',
    description:
      'The Table Lamp is a functional and decorative lighting solution for your living space. With a modern design, it provides both ambient and task lighting, enhancing the atmosphere.',
    images: ['https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp'],
    stock: 9,
    shippingNote: 'Ships in 1-2 business days',
    warranty: '3 months warranty',
    specs: [
      { label: 'Brand', value: 'Unbranded' },
      { label: 'SKU', value: 'HOM-BRD-TAB-047' },
      { label: 'Weight', value: '4 kg' },
      { label: 'Dimensions (W × H × D)', value: '8.98 × 13.41 × 5.65 cm' },
      { label: 'Warranty', value: '3 months warranty' },
    ],
  },

  p10: {
    brand: 'Basic Books',
    sku: 'BOK-BAS-DES-010',
    description:
      'Don Norman explains why some products satisfy customers while others only frustrate them, and how good design makes objects easy to understand and use. Revised and expanded edition.',
    images: [bookCover('9780465050659')],
    stock: 51,
    shippingNote: 'Ships in 1-2 business days',
    warranty: null,
    specs: [
      { label: 'Author', value: 'Don Norman' },
      { label: 'Publisher', value: 'Basic Books' },
      { label: 'Edition', value: 'Revised and expanded, 2013' },
      { label: 'ISBN', value: '9780465050659' },
    ],
  },
}

const allProducts = [...featured, ...newArrivals]

export async function mockProductPage(
  slug: string,
  scenario: MockScenario,
): Promise<ProductPageData | null> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(500)
  if (scenario === 'error') throw new Error('The catalog service did not respond (mock error).')
  const base = allProducts.find((p) => p.slug === slug)
  // ?mock=empty previews the "product not found" state.
  if (scenario === 'empty' || !base) return null
  const others = allProducts.filter((p) => p.id !== base.id)
  // Same category first, then fill up to 4 from the rest.
  const related = [
    ...others.filter((p) => p.category.slug === base.category.slug),
    ...others.filter((p) => p.category.slug !== base.category.slug),
  ].slice(0, 4)
  return { product: { ...base, ...details[base.id]! }, related }
}
