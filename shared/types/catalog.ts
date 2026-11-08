// Provisional shapes used by the dev mock data.
// [TODO: ask] Replace with the real API contract once the catalog API is documented (see AGENTS.md).

export interface Money {
  /** Display amount as sent by the API. Never recompute it on the frontend. */
  amount: number
  currency: 'USD'
}

export interface Category {
  slug: string
  name: string
  imageUrl: string
  productCount: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category: Pick<Category, 'slug' | 'name'>
  price: Money
  imageUrl: string
  inStock: boolean
}

export interface HeroSlide {
  id: string
  title: string
  description: string
  imageUrl: string
  cta: { label: string; to: string }
}

export interface HomeData {
  heroSlides: HeroSlide[]
  categories: Category[]
  featured: Product[]
  newArrivals: Product[]
}

export interface CartSummary {
  itemCount: number
}

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductDetail extends Product {
  brand: string | null
  sku: string
  description: string
  /** Gallery images, first one is the main image. */
  images: string[]
  /** Units available, as sent by the API. The API still checks stock when adding to cart. */
  stock: number
  /** Delivery estimate text from the API, such as "Ships in 1-2 business days". */
  shippingNote: string | null
  warranty: string | null
  specs: ProductSpec[]
}

export interface ProductPageData {
  product: ProductDetail
  /** Other products to show below, chosen by the API. */
  related: Product[]
}

export type ProductSort = 'relevance' | 'price-asc' | 'price-desc'

/** What the customer asked the listing for. Every field is optional. */
export interface ProductQuery {
  q?: string
  category?: string
  brands?: string[]
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  sort?: ProductSort
  page?: number
}

export interface FacetOption {
  value: string
  label: string
  /** Matching products, as counted by the API. */
  count: number
}

export interface ProductListResult {
  items: Product[]
  /** Total matching products across all pages. */
  total: number
  page: number
  pageSize: number
  facets: {
    categories: FacetOption[]
    brands: FacetOption[]
  }
}
