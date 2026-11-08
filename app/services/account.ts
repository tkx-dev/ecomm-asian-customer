// Account API client: profile, shipping addresses and the recent-orders summary.
// All account requests go through this file (see AGENTS.md).
// [TODO: ask] Endpoints, auth (session cookie) and validation rules. Do not guess them.
import type {
  AccountData,
  Address,
  AddressInput,
  Profile,
  ProfileInput,
} from '#shared/types/account'
import type { MockScenario, MutationScenario } from './mock/account'

export type { MockScenario, MutationScenario }

const notConnected = () => new Error('The account service is not connected yet.')

export async function getAccount(scenario: MockScenario = 'ok'): Promise<AccountData> {
  if (import.meta.dev) {
    const { mockGetAccount } = await import('./mock/account')
    return mockGetAccount(scenario)
  }
  throw notConnected()
}

export async function updateProfile(
  input: ProfileInput,
  scenario: MutationScenario = 'ok',
): Promise<Profile> {
  if (import.meta.dev) {
    const { mockUpdateProfile } = await import('./mock/account')
    return mockUpdateProfile(input, scenario)
  }
  throw notConnected()
}

/** Creates an address when `id` is null, otherwise updates it. Returns the full list. */
export async function saveAddress(
  id: string | null,
  input: AddressInput,
  scenario: MutationScenario = 'ok',
): Promise<Address[]> {
  if (import.meta.dev) {
    const { mockSaveAddress } = await import('./mock/account')
    return mockSaveAddress(id, input, scenario)
  }
  throw notConnected()
}

export async function deleteAddress(
  id: string,
  scenario: MutationScenario = 'ok',
): Promise<Address[]> {
  if (import.meta.dev) {
    const { mockDeleteAddress } = await import('./mock/account')
    return mockDeleteAddress(id, scenario)
  }
  throw notConnected()
}

export async function setDefaultAddress(
  id: string,
  scenario: MutationScenario = 'ok',
): Promise<Address[]> {
  if (import.meta.dev) {
    const { mockSetDefaultAddress } = await import('./mock/account')
    return mockSetDefaultAddress(id, scenario)
  }
  throw notConnected()
}
