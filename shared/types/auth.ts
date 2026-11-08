// Temporary auth types. [TODO: ask] Match these to the real auth API once it is documented.

export type AuthMode = 'login' | 'register'

export type SocialProvider = 'google' | 'facebook'

export interface SignInInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
