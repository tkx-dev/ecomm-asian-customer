// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

// Runs before first paint to apply the saved/system theme and avoid a flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      script: [{ innerHTML: themeInitScript, tagPosition: 'head' }],
    },
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
})
