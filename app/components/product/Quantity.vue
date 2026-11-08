<script setup lang="ts">
// Quantity stepper with a typed value. The upper limit is the stock the API reported;
// the API still checks it when the item is added.
const props = withDefaults(defineProps<{ id: string; max: number; disabled?: boolean }>(), {
  disabled: false,
})
const model = defineModel<number>({ required: true })

const text = ref(String(model.value))
watch(model, (value) => (text.value = String(value)))

const clamp = (n: number) => Math.min(Math.max(Math.trunc(n) || 1, 1), Math.max(props.max, 1))

function commit() {
  model.value = clamp(Number(text.value))
  text.value = String(model.value)
}

const step =
  'inline-flex size-11 cursor-pointer items-center justify-center text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40'
</script>

<template>
  <div class="inline-flex items-center overflow-hidden rounded-full border">
    <button
      type="button"
      :class="step"
      :disabled="disabled || model <= 1"
      aria-label="Decrease quantity"
      :aria-controls="id"
      @click="model = clamp(model - 1)"
    >
      <AppIcon name="minus" :size="18" />
    </button>
    <input
      :id="id"
      v-model="text"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :disabled="disabled"
      class="h-11 w-12 border-x bg-transparent text-center text-base font-semibold tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      @blur="commit"
      @keydown.enter.prevent="commit"
    />
    <button
      type="button"
      :class="step"
      :disabled="disabled || model >= max"
      aria-label="Increase quantity"
      :aria-controls="id"
      @click="model = clamp(model + 1)"
    >
      <AppIcon name="plus" :size="18" />
    </button>
  </div>
</template>
