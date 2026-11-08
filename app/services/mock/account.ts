// Dev-only dummy data. Never imported in production builds (see ../account.ts).
// Changes live in memory and reset when the dev server reloads this module.
import type { AccountData, Address, AddressInput, ProfileInput } from '#shared/types/account'

export type MockScenario = 'ok' | 'loading' | 'error' | 'empty'
export type MutationScenario = 'ok' | 'loading' | 'error'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

function seed(): AccountData {
  const awaitingPayment = {
    id: 'ord_2',
    number: 'IS-24093',
    placedAt: '2026-11-03T08:45:00Z',
    itemCount: 1,
    total: { amount: 59, currency: 'USD' as const },
    status: 'pending_payment' as const,
    // Relative to now so the countdown always has time left in dev.
    paymentDueAt: new Date(Date.now() + (4 * 3600 + 20 * 60 + 28) * 1000).toISOString(),
  }
  return {
    profile: {
      id: 'u_1001',
      name: 'Nattapong Srisuk',
      email: 'nattapong@example.com',
      phone: '+66 81 234 5678',
      memberSince: '2025-03-14T09:20:00Z',
    },
    addresses: [
      {
        id: 'addr_1',
        label: 'Home',
        recipient: 'Nattapong Srisuk',
        phone: '+66 81 234 5678',
        line1: '88/12 Sukhumvit Soi 24',
        line2: 'Khlong Tan, Khlong Toei',
        city: 'Bangkok',
        region: null,
        postalCode: '10110',
        country: 'Thailand',
        isDefault: true,
      },
      {
        id: 'addr_2',
        label: 'Office',
        recipient: 'Nattapong Srisuk',
        phone: '+66 2 108 4400',
        line1: 'Floor 21, Sathorn Square',
        line2: '98 North Sathorn Road, Silom',
        city: 'Bangkok',
        region: null,
        postalCode: '10500',
        country: 'Thailand',
        isDefault: false,
      },
      {
        id: 'addr_3',
        label: null,
        recipient: 'Somjai Srisuk',
        phone: '+66 89 765 4321',
        line1: '45 Moo 3, Nong Hoi',
        line2: null,
        city: 'Mueang Chiang Mai',
        region: 'Chiang Mai',
        postalCode: '50000',
        country: 'Thailand',
        isDefault: false,
      },
    ],
    recentOrders: [
      {
        id: 'ord_3',
        number: 'IS-24117',
        placedAt: '2026-11-05T14:02:00Z',
        itemCount: 2,
        total: { amount: 184.5, currency: 'USD' },
        status: 'shipped',
      },
      awaitingPayment,
      {
        id: 'ord_1',
        number: 'IS-23810',
        placedAt: '2026-10-12T17:30:00Z',
        itemCount: 4,
        total: { amount: 312.2, currency: 'USD' },
        status: 'completed',
      },
    ],
    orderCounts: { pending_payment: 1, paid: 0, processing: 1, shipped: 1, delivered: 0 },
    awaitingPayment,
  }
}

// A new account with nothing saved yet (?mock=empty).
function emptySeed(): AccountData {
  return {
    profile: {
      id: 'u_2002',
      name: 'Ploy Chaiyaporn',
      email: 'ploy@example.com',
      phone: null,
      memberSince: '2026-11-08T03:00:00Z',
    },
    addresses: [],
    recentOrders: [],
    orderCounts: {},
    awaitingPayment: null,
  }
}

const stores = { ok: seed(), empty: emptySeed() }
// Mutations act on whichever account was loaded last.
let store = stores.ok

let nextId = 100

export async function mockGetAccount(scenario: MockScenario): Promise<AccountData> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(600)
  if (scenario === 'error') throw new Error('The account service did not respond (mock error).')
  store = scenario === 'empty' ? stores.empty : stores.ok
  return clone(store)
}

async function mutate<T>(scenario: MutationScenario, failure: string, apply: () => T): Promise<T> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(700)
  if (scenario === 'error') throw new Error(`${failure} (mock error).`)
  return clone(apply())
}

export function mockUpdateProfile(input: ProfileInput, scenario: MutationScenario) {
  return mutate(scenario, 'Your details were not saved', () => {
    store.profile = { ...store.profile, ...input }
    return store.profile
  })
}

// Mimics the backend: the first address saved becomes the default.
export function mockSaveAddress(
  id: string | null,
  input: AddressInput,
  scenario: MutationScenario,
): Promise<Address[]> {
  return mutate(scenario, 'The address was not saved', () => {
    if (id) {
      store.addresses = store.addresses.map((a) => (a.id === id ? { ...a, ...input } : a))
    } else {
      store.addresses.push({
        ...input,
        id: `addr_${nextId++}`,
        isDefault: store.addresses.length === 0,
      })
    }
    return store.addresses
  })
}

// Mimics the backend: deleting the default makes the next address the default.
export function mockDeleteAddress(id: string, scenario: MutationScenario): Promise<Address[]> {
  return mutate(scenario, 'The address was not deleted', () => {
    const removed = store.addresses.find((a) => a.id === id)
    store.addresses = store.addresses.filter((a) => a.id !== id)
    if (removed?.isDefault && store.addresses[0]) store.addresses[0].isDefault = true
    return store.addresses
  })
}

export function mockSetDefaultAddress(id: string, scenario: MutationScenario): Promise<Address[]> {
  return mutate(scenario, 'The default address was not changed', () => {
    store.addresses = store.addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    return store.addresses
  })
}
