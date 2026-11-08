<script setup lang="ts">
import type { Profile } from '#shared/types/account'
import { updateProfile, type MutationScenario } from '~/services/account'

const props = defineProps<{
  profile?: Profile
  loading: boolean
  scenario: MutationScenario
}>()
const emit = defineEmits<{ saved: [profile: Profile] }>()

const form = reactive({ name: '', email: '', phone: '' })
type FieldKey = keyof typeof form
const errors = reactive<Record<FieldKey, string>>({ name: '', email: '', phone: '' })
const fieldRefs: Partial<Record<FieldKey, { focus: () => void }>> = {}

// Read-only until the customer selects Edit details.
const editing = ref(false)
const editButton = ref<HTMLButtonElement>()
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

const details = computed(
  () =>
    [
      { key: 'name', label: 'Full name', icon: 'user', value: props.profile?.name },
      { key: 'email', label: 'Email', icon: 'mail', value: props.profile?.email },
      { key: 'phone', label: 'Phone', icon: 'phone', value: props.profile?.phone },
    ] as const,
)

function reset() {
  form.name = props.profile?.name ?? ''
  form.email = props.profile?.email ?? ''
  form.phone = props.profile?.phone ?? ''
}
watch(() => props.profile, reset, { immediate: true })

async function startEdit() {
  reset()
  saved.value = false
  saveError.value = ''
  editing.value = true
  await nextTick()
  fieldRefs.name?.focus()
}

async function stopEdit() {
  reset()
  for (const key of Object.keys(errors) as FieldKey[]) errors[key] = ''
  saveError.value = ''
  editing.value = false
  await nextTick()
  editButton.value?.focus()
}

const dirty = computed(
  () =>
    !!props.profile &&
    (form.name.trim() !== props.profile.name ||
      form.email.trim() !== props.profile.email ||
      form.phone.trim() !== (props.profile.phone ?? '')),
)

for (const key of Object.keys(form) as FieldKey[]) {
  watch(
    () => form[key],
    () => {
      errors[key] = ''
      saved.value = false
    },
  )
}

// Presence and format only. [TODO: ask] Real rules (phone format, email change verification).
function validate() {
  errors.name = form.name.trim() ? '' : 'Enter your name.'
  errors.email = !form.email.trim()
    ? 'Enter your email address.'
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? ''
      : 'Enter an email address like name@example.com.'
  const firstInvalid = (['name', 'email'] as const).find((key) => errors[key])
  if (firstInvalid) fieldRefs[firstInvalid]?.focus()
  return !firstInvalid
}

async function submit() {
  if (saving.value || !dirty.value) return
  saveError.value = ''
  if (!validate()) return
  saving.value = true
  try {
    const profile = await updateProfile(
      { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null },
      props.scenario,
    )
    emit('saved', profile)
    await stopEdit()
    saved.value = true
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : 'The server did not respond.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section id="details" class="scroll-mt-24" aria-labelledby="details-title">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id="details-title" class="text-xl font-semibold tracking-tight lg:text-2xl">
          Personal details
        </h2>
        <p class="mt-1 text-muted-foreground">The name and contact details on your orders.</p>
      </div>
      <button
        v-if="!loading && !editing"
        ref="editButton"
        type="button"
        class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-5 font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        @click="startEdit"
      >
        <AppIcon name="pencil" :size="18" />
        Edit details
      </button>
    </div>

    <!-- Loading -->
    <ul v-if="loading" class="mt-8 divide-y rounded-xl border bg-card" aria-hidden="true">
      <li v-for="n in 3" :key="n" class="flex items-center gap-4 p-5">
        <div class="size-10 rounded-full bg-muted motion-safe:animate-pulse" />
        <div class="space-y-2">
          <div class="h-3 w-20 rounded bg-muted motion-safe:animate-pulse" />
          <div class="h-4 w-44 rounded bg-muted motion-safe:animate-pulse" />
        </div>
      </li>
    </ul>

    <!-- Read-only view -->
    <template v-else-if="!editing">
      <dl class="mt-8 divide-y rounded-xl border bg-card text-card-foreground">
        <div v-for="item in details" :key="item.key" class="flex items-center gap-4 p-5">
          <span
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary"
          >
            <AppIcon :name="item.icon" :size="18" />
          </span>
          <div class="min-w-0">
            <dt class="text-sm text-muted-foreground">{{ item.label }}</dt>
            <dd v-if="item.value" class="font-medium break-words">{{ item.value }}</dd>
            <dd v-else class="text-muted-foreground">Not added</dd>
          </div>
        </div>
      </dl>
    </template>

    <!-- Edit form -->
    <form
      v-else
      class="mt-8"
      novalidate
      :aria-busy="saving"
      @submit.prevent="submit"
      @keydown.esc="!saving && stopEdit()"
    >
      <div
        v-if="saveError"
        role="alert"
        class="mb-6 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"
      >
        <AppIcon name="alert" class="mt-0.5 text-destructive" />
        <p>
          <span class="font-semibold">Changes not saved.</span>
          <span class="text-muted-foreground"> {{ saveError }} Select Save changes again.</span>
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <AuthField
          id="profile-name"
          :ref="(el) => (fieldRefs.name = el as never)"
          v-model="form.name"
          label="Full name"
          icon="user"
          autocomplete="name"
          :error="errors.name"
        />
        <AuthField
          id="profile-email"
          :ref="(el) => (fieldRefs.email = el as never)"
          v-model="form.email"
          label="Email"
          type="email"
          icon="mail"
          autocomplete="email"
          :error="errors.email"
        />
        <AuthField
          id="profile-phone"
          v-model="form.phone"
          label="Phone (optional)"
          type="tel"
          icon="phone"
          autocomplete="tel"
          :error="errors.phone"
        />
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          :disabled="!dirty || saving"
          class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AppIcon
            v-if="saving"
            name="spinner"
            :size="18"
            class="animate-spin motion-reduce:animate-none"
          />
          {{ saving ? 'Saving' : 'Save changes' }}
        </button>
        <button
          type="button"
          :disabled="saving"
          class="inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
          @click="stopEdit"
        >
          Cancel
        </button>
      </div>
    </form>

    <p
      role="status"
      class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-success"
      :class="{ 'sr-only': !saved }"
    >
      <AppIcon v-if="saved" name="check" :size="16" />
      {{ saved ? 'Changes saved' : '' }}
    </p>
  </section>
</template>
