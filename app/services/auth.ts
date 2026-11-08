// Auth API client. All auth requests go through this file (see AGENTS.md).
// [TODO: ask] Endpoints, base URL and session format (prefer httpOnly cookie, never localStorage).
import type { RegisterInput, SignInInput, SocialProvider } from '#shared/types/auth'
import type { MockScenario } from './mock/auth'

export type { MockScenario }

export async function signIn(input: SignInInput, scenario: MockScenario = 'ok'): Promise<void> {
  if (import.meta.dev) {
    const { mockSignIn } = await import('./mock/auth')
    return mockSignIn(input, scenario)
  }
  throw new Error('Sign-in is not connected yet.')
}

export async function register(input: RegisterInput, scenario: MockScenario = 'ok'): Promise<void> {
  if (import.meta.dev) {
    const { mockRegister } = await import('./mock/auth')
    return mockRegister(input, scenario)
  }
  throw new Error('Account sign-up is not connected yet.')
}

// Google / Facebook sign-in. Signs in an existing account or creates a new one.
// [TODO: ask] The OAuth start URL and callback flow. Usually the browser is redirected to the
// backend, which talks to the provider and sets the session cookie. Never put a client secret here.
export async function signInWithProvider(
  provider: SocialProvider,
  scenario: MockScenario = 'ok',
): Promise<void> {
  if (import.meta.dev) {
    const { mockSocialSignIn } = await import('./mock/auth')
    return mockSocialSignIn(provider, scenario)
  }
  throw new Error(`${provider === 'google' ? 'Google' : 'Facebook'} sign-in is not connected yet.`)
}

export async function signOut(scenario: MockScenario = 'ok'): Promise<void> {
  if (import.meta.dev) {
    const { mockSignOut } = await import('./mock/auth')
    return mockSignOut(scenario)
  }
  throw new Error('Sign-out is not connected yet.')
}
