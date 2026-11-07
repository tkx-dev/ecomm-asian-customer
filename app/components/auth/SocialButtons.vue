<script setup lang="ts">
import type { SocialProvider } from '#shared/types/auth'

// Provider buttons. Logos keep their official colours; everything else uses theme tokens.
defineProps<{ pending: SocialProvider | null; disabled: boolean }>()
defineEmits<{ select: [provider: SocialProvider] }>()

const providers: { id: SocialProvider; label: string }[] = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'facebook', label: 'Continue with Facebook' },
]
</script>

<template>
  <div class="space-y-3">
    <button
      v-for="provider in providers"
      :key="provider.id"
      type="button"
      :disabled="disabled"
      :aria-busy="pending === provider.id"
      class="relative inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-input bg-background px-6 font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
      @click="$emit('select', provider.id)"
    >
      <AppIcon
        v-if="pending === provider.id"
        name="spinner"
        :size="20"
        class="animate-spin motion-reduce:animate-none"
      />
      <svg
        v-else-if="provider.id === 'google'"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
        />
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#1877F2"
          d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"
        />
      </svg>
      {{ provider.label }}
    </button>
  </div>
</template>
