// Catalog API client. All catalog requests go through this file (see AGENTS.md).
import type {
  HomeData,
  ProductListResult,
  ProductPageData,
  ProductQuery,
} from '#shared/types/catalog'
import type { MockScenario } from './mock/catalog'

export type { MockScenario }

export async function getHomeData(scenario: MockScenario = 'ok'): Promise<HomeData> {
  if (import.meta.dev) {
    const { mockHomeData } = await import('./mock/catalog')
    return mockHomeData(scenario)
  }
  // [TODO: ask] Call the real endpoint once the catalog API is documented. Do not guess it.
  throw new Error('The catalog API is not connected yet.')
}

/** Product page data, or null when no product has this slug. */
export async function getProductPage(
  slug: string,
  scenario: MockScenario = 'ok',
): Promise<ProductPageData | null> {
  if (import.meta.dev) {
    const { mockProductPage } = await import('./mock/catalog')
    return mockProductPage(slug, scenario)
  }
  // [TODO: ask] Call the real endpoint once the catalog API is documented. Do not guess it.
  throw new Error('The catalog API is not connected yet.')
}

/** One page of products matching the query, with filter counts. */
export async function listProducts(
  query: ProductQuery,
  scenario: MockScenario = 'ok',
): Promise<ProductListResult> {
  if (import.meta.dev) {
    const { mockListProducts } = await import('./mock/catalog')
    return mockListProducts(query, scenario)
  }
  // [TODO: ask] Endpoint and query parameter names. Do not guess them.
  throw new Error('The catalog API is not connected yet.')
}
