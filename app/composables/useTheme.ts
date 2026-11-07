export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

/**
 * Light/dark theme with a "system" option.
 * The initial class is applied before hydration by the inline script in nuxt.config.ts,
 * so there is no flash of the wrong theme.
 */
export function useTheme() {
  const preference = useState<ThemePreference>('theme-preference', () => 'system')
  const isDark = useState<boolean>('theme-is-dark', () => false)

  function apply() {
    if (import.meta.server) return
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = preference.value === 'dark' || (preference.value === 'system' && systemDark)
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function setTheme(value: ThemePreference) {
    preference.value = value
    try {
      if (value === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* storage unavailable */
    }
    apply()
  }

  function toggle() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  onMounted(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') preference.value = stored
    } catch {
      /* storage unavailable */
    }
    apply()

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => preference.value === 'system' && apply()
    media.addEventListener('change', onChange)
    onBeforeUnmount(() => media.removeEventListener('change', onChange))
  })

  return { preference: readonly(preference), isDark: readonly(isDark), setTheme, toggle }
}
