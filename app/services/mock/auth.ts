// Dev-only auth stubs. Never imported in production builds (see ../auth.ts).
import type { RegisterInput, SignInInput, SocialProvider } from '#shared/types/auth'

export type MockScenario = 'ok' | 'loading' | 'error'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockSignIn(_input: SignInInput, scenario: MockScenario): Promise<void> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(800)
  if (scenario === 'error') throw new Error('Email or password is incorrect (mock error).')
}

export async function mockRegister(_input: RegisterInput, scenario: MockScenario): Promise<void> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(800)
  if (scenario === 'error')
    throw new Error('An account with this email already exists (mock error).')
}

export async function mockSocialSignIn(
  provider: SocialProvider,
  scenario: MockScenario,
): Promise<void> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(800)
  if (scenario === 'error') {
    const name = provider === 'google' ? 'Google' : 'Facebook'
    throw new Error(`${name} did not confirm your account (mock error).`)
  }
}

export async function mockSignOut(scenario: MockScenario): Promise<void> {
  if (scenario === 'loading') return new Promise(() => {})
  await wait(500)
  if (scenario === 'error') throw new Error('The session did not end (mock error).')
}
