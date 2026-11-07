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
