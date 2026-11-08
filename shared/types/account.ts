// Provisional account shapes used by the dev mock data.
// [TODO: ask] Match these to the real account API once it is documented (see AGENTS.md).
import type { OrderCounts, OrderSummary } from './order'

export interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  /** ISO 8601 date the account was created. */
  memberSince: string
}

export type ProfileInput = Pick<Profile, 'name' | 'email' | 'phone'>

export interface Address {
  id: string
  /** Optional name the customer gives the address, such as "Home". */
  label: string | null
  recipient: string
  phone: string
  line1: string
  line2: string | null
  city: string
  /** State or province. Not every country uses one. */
  region: string | null
  postalCode: string
  country: string
  /** Set by the API. The frontend asks for a change and shows what comes back. */
  isDefault: boolean
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'>

export interface AccountData {
  profile: Profile
  addresses: Address[]
  recentOrders: OrderSummary[]
  orderCounts: OrderCounts
  /** The order that most needs paying, if any. Chosen by the API. */
  awaitingPayment: OrderSummary | null
}
