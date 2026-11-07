<script setup lang="ts">
// Labelled input with an inline error. Password fields get a show/hide toggle.
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    type?: 'text' | 'email' | 'password'
    autocomplete?: string
    error?: string
  }>(),
  { type: 'text', autocomplete: undefined, error: '' },
)

const model = defineModel<string>({ required: true })
const input = ref<HTMLInputElement>()
const revealed = ref(false)

const inputType = computed(() =>
  props.type === 'password' && revealed.value ? 'text' : props.type,
)

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-medium">{{ label }}</label>
    <div class="relative mt-1.5">
      <input
        :id="id"
        ref="input"
        v-model="model"
        :type="inputType"
        :autocomplete="autocomplete"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
        :class="[
          'h-12 w-full rounded-lg border bg-background px-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring',
          type === 'password' && 'pr-12',
          error ? 'border-destructive' : 'border-input',
        ]"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        :aria-label="revealed ? 'Hide password' : 'Show password'"
        :aria-pressed="revealed"
        :aria-controls="id"
        @click="revealed = !revealed"
      >
        <AppIcon :name="revealed ? 'eye-off' : 'eye'" :size="18" />
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-sm text-destructive">{{ error }}</p>
  </div>
</template>
