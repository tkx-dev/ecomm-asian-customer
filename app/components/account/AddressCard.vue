<script setup lang="ts">
import type { Address } from '#shared/types/account'

// A saved address drawn as a parcel label: name strip, tear line, then the address itself.
const props = defineProps<{
  address: Address
  /** Action running on this card, if any. Every button is disabled meanwhile. */
  busy: 'delete' | 'default' | null
  /** True while another card or the form is busy. */
  locked: boolean
  confirmingDelete: boolean
}>()

defineEmits<{
  edit: []
  'request-delete': []
  'confirm-delete': []
  'cancel-delete': []
  'set-default': []
}>()

const titleId = computed(() => `address-${props.address.id}-title`)
const disabled = computed(() => !!props.busy || props.locked)

const action =
  'inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50'
</script>

<template>
  <article
    :class="[
      'parcel relative flex flex-col rounded-xl border bg-card text-card-foreground',
      address.isDefault && 'is-default border-primary',
    ]"
    :aria-labelledby="titleId"
  >
    <header class="flex min-h-14 items-center gap-3 px-5">
      <AppIcon
        name="map-pin"
        :class="address.isDefault ? 'text-primary' : 'text-muted-foreground'"
      />
      <h3 :id="titleId" class="truncate font-semibold">
        {{ address.label || address.recipient }}
      </h3>
      <span
        v-if="address.isDefault"
        class="ml-auto shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground"
      >
        Default
      </span>
    </header>

    <div class="tear" aria-hidden="true" />

    <div class="flex-1 px-5 pt-4 pb-5">
      <p class="text-sm text-muted-foreground">Ship to</p>
      <address class="mt-1 leading-relaxed not-italic">
        <span class="block font-medium">{{ address.recipient }}</span>
        <span class="block">{{ address.line1 }}</span>
        <span v-if="address.line2" class="block">{{ address.line2 }}</span>
        <span class="block">
          {{ address.city }}<template v-if="address.region">, {{ address.region }}</template>
          {{ address.postalCode }}
        </span>
        <span class="block">{{ address.country }}</span>
      </address>
      <p class="mt-2 text-sm text-muted-foreground">{{ address.phone }}</p>
    </div>

    <footer class="flex min-h-14 flex-wrap items-center gap-1 border-t px-2 py-2">
      <template v-if="confirmingDelete">
        <p class="px-3 text-sm font-medium">Delete this address?</p>
        <div class="ml-auto flex gap-1">
          <button
            type="button"
            :disabled="!!busy"
            class="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md bg-destructive px-3 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70"
            @click="$emit('confirm-delete')"
          >
            <AppIcon
              v-if="busy === 'delete'"
              name="spinner"
              :size="16"
              class="animate-spin motion-reduce:animate-none"
            />
            {{ busy === 'delete' ? 'Deleting' : 'Delete' }}
          </button>
          <button type="button" :disabled="!!busy" :class="action" @click="$emit('cancel-delete')">
            Keep
          </button>
        </div>
      </template>

      <template v-else>
        <button type="button" :disabled="disabled" :class="action" @click="$emit('edit')">
          <AppIcon name="pencil" :size="16" />
          Edit
        </button>
        <button type="button" :disabled="disabled" :class="action" @click="$emit('request-delete')">
          <AppIcon name="trash" :size="16" />
          Delete
        </button>
        <button
          v-if="!address.isDefault"
          type="button"
          :disabled="disabled"
          :class="[action, 'ml-auto']"
          @click="$emit('set-default')"
        >
          <AppIcon
            :name="busy === 'default' ? 'spinner' : 'check'"
            :size="16"
            :class="busy === 'default' && 'animate-spin motion-reduce:animate-none'"
          />
          Set as default
        </button>
      </template>
    </footer>
  </article>
</template>

<style scoped>
.parcel {
  --notch-border: var(--border);
}
.parcel.is-default {
  --notch-border: var(--primary);
}

/* Dashed tear line with a half-circle notch cut into each side of the card. */
.tear {
  position: relative;
  height: 2px;
  margin-inline: 14px;
  background-image: linear-gradient(to right, var(--notch-border) 55%, transparent 0);
  background-size: 10px 2px;
}
.tear::before,
.tear::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  border: 1px solid var(--notch-border);
  border-radius: 9999px;
  /* The surface behind the card, so the notch looks cut out. Set by the parent if not the page. */
  background: var(--notch-bg, var(--background));
  translate: 0 -50%;
}
/* Centre each notch on the card's 1px border, 14px outside the tear line, and show only its inner half. */
.tear::before {
  left: -23.5px;
  clip-path: inset(0 0 0 50%);
}
.tear::after {
  right: -23.5px;
  clip-path: inset(0 50% 0 0);
}
</style>
