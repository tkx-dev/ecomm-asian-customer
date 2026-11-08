<script setup lang="ts">
import type { Address, AddressInput } from '#shared/types/account'
import { saveAddress, type MutationScenario } from '~/services/account'

// Add or edit one shipping address. Saves through the account service and emits the new list.
const props = defineProps<{
  /** The address being edited. Leave out to add a new one. */
  address?: Address
  scenario: MutationScenario
}>()
const emit = defineEmits<{ saved: [addresses: Address[]]; cancel: [] }>()

const form = reactive({
  label: props.address?.label ?? '',
  recipient: props.address?.recipient ?? '',
  phone: props.address?.phone ?? '',
  line1: props.address?.line1 ?? '',
  line2: props.address?.line2 ?? '',
  city: props.address?.city ?? '',
  region: props.address?.region ?? '',
  postalCode: props.address?.postalCode ?? '',
  country: props.address?.country ?? '',
})
type FieldKey = keyof typeof form

// Presence only. [TODO: ask] Countries we ship to and postal-code / phone rules per country.
const required: Partial<Record<FieldKey, string>> = {
  recipient: 'Enter the name of the person receiving the parcel.',
  phone: 'Enter a phone number the courier can call.',
  line1: 'Enter the street address.',
  city: 'Enter the city or district.',
  postalCode: 'Enter the postal code.',
  country: 'Enter the country.',
}

const errors = reactive<Record<FieldKey, string>>(
  Object.fromEntries(Object.keys(form).map((key) => [key, ''])) as Record<FieldKey, string>,
)
const fieldRefs: Partial<Record<FieldKey, { focus: () => void }>> = {}
const saving = ref(false)
const saveError = ref('')

for (const key of Object.keys(form) as FieldKey[]) {
  watch(
    () => form[key],
    () => (errors[key] = ''),
  )
}

onMounted(() => fieldRefs.label?.focus())

const order: FieldKey[] = ['recipient', 'phone', 'line1', 'city', 'postalCode', 'country']

function validate() {
  for (const key of order) errors[key] = form[key].trim() ? '' : (required[key] ?? '')
  const firstInvalid = order.find((key) => errors[key])
  if (firstInvalid) fieldRefs[firstInvalid]?.focus()
  return !firstInvalid
}

async function submit() {
  if (saving.value) return
  saveError.value = ''
  if (!validate()) return
  const optional = (value: string) => value.trim() || null
  const input: AddressInput = {
    label: optional(form.label),
    recipient: form.recipient.trim(),
    phone: form.phone.trim(),
    line1: form.line1.trim(),
    line2: optional(form.line2),
    city: form.city.trim(),
    region: optional(form.region),
    postalCode: form.postalCode.trim(),
    country: form.country.trim(),
  }
  saving.value = true
  try {
    emit('saved', await saveAddress(props.address?.id ?? null, input, props.scenario))
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : 'The server did not respond.'
  } finally {
    saving.value = false
  }
}

const formId = computed(() => (props.address ? `edit-${props.address.id}` : 'new-address'))
const bind = (key: FieldKey) => ({
  id: `${formId.value}-${key}`,
  ref: (el: unknown) => (fieldRefs[key] = el as never),
  error: errors[key],
})
</script>

<template>
  <form
    class="rounded-xl border border-primary bg-card p-5 text-card-foreground sm:p-6"
    novalidate
    :aria-busy="saving"
    :aria-labelledby="`${formId}-title`"
    @submit.prevent="submit"
    @keydown.esc="!saving && $emit('cancel')"
  >
    <h3 :id="`${formId}-title`" class="text-lg font-semibold">
      {{ address ? 'Edit address' : 'New address' }}
    </h3>

    <div
      v-if="saveError"
      role="alert"
      class="mt-4 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"
    >
      <AppIcon name="alert" class="mt-0.5 text-destructive" />
      <p>
        <span class="font-semibold">Address not saved.</span>
        <span class="text-muted-foreground"> {{ saveError }} Select Save address again.</span>
      </p>
    </div>

    <div class="mt-5 grid gap-5 sm:grid-cols-2">
      <AuthField
        v-bind="bind('label')"
        v-model="form.label"
        label="Address name (optional)"
        class="sm:col-span-2"
      />
      <AuthField
        v-bind="bind('recipient')"
        v-model="form.recipient"
        label="Recipient"
        autocomplete="name"
      />
      <AuthField
        v-bind="bind('phone')"
        v-model="form.phone"
        label="Phone"
        type="tel"
        autocomplete="tel"
      />
      <AuthField
        v-bind="bind('line1')"
        v-model="form.line1"
        label="Street address"
        autocomplete="address-line1"
        class="sm:col-span-2"
      />
      <AuthField
        v-bind="bind('line2')"
        v-model="form.line2"
        label="Apartment, building, area (optional)"
        autocomplete="address-line2"
        class="sm:col-span-2"
      />
      <AuthField
        v-bind="bind('city')"
        v-model="form.city"
        label="City or district"
        autocomplete="address-level2"
      />
      <AuthField
        v-bind="bind('region')"
        v-model="form.region"
        label="State or province (optional)"
        autocomplete="address-level1"
      />
      <AuthField
        v-bind="bind('postalCode')"
        v-model="form.postalCode"
        label="Postal code"
        autocomplete="postal-code"
      />
      <AuthField
        v-bind="bind('country')"
        v-model="form.country"
        label="Country"
        autocomplete="country-name"
      />
    </div>

    <div class="mt-6 flex flex-wrap gap-3">
      <button
        type="submit"
        :disabled="saving"
        class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70"
      >
        <AppIcon
          v-if="saving"
          name="spinner"
          :size="18"
          class="animate-spin motion-reduce:animate-none"
        />
        {{ saving ? 'Saving' : 'Save address' }}
      </button>
      <button
        type="button"
        :disabled="saving"
        class="inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
