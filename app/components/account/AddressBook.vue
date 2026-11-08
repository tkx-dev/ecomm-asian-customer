<script setup lang="ts">
import type { Address } from '#shared/types/account'
import { deleteAddress, setDefaultAddress, type MutationScenario } from '~/services/account'

const props = defineProps<{
  addresses?: Address[]
  loading: boolean
  scenario: MutationScenario
}>()
const emit = defineEmits<{ update: [addresses: Address[]] }>()

// One thing at a time: the add form, one edit form, or one delete confirmation.
const editing = ref<string | 'new' | null>(null)
const confirmingDelete = ref<string | null>(null)
const busy = ref<{ id: string; action: 'delete' | 'default' } | null>(null)
const actionError = ref<{ title: string; message: string } | null>(null)
const notice = ref('')
const heading = ref<HTMLElement>()

const list = computed(() => props.addresses ?? [])
const locked = computed(() => !!busy.value || editing.value !== null)

function startAdd() {
  reset()
  editing.value = 'new'
}
function startEdit(id: string) {
  reset()
  editing.value = id
}
function reset() {
  actionError.value = null
  notice.value = ''
  confirmingDelete.value = null
}

function onSaved(addresses: Address[]) {
  notice.value = editing.value === 'new' ? 'Address added' : 'Address saved'
  editing.value = null
  emit('update', addresses)
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'The server did not respond.'

async function remove(id: string) {
  busy.value = { id, action: 'delete' }
  actionError.value = null
  try {
    emit('update', await deleteAddress(id, props.scenario))
    notice.value = 'Address deleted'
    confirmingDelete.value = null
    heading.value?.focus()
  } catch (error) {
    actionError.value = { title: 'Address not deleted', message: errorMessage(error) }
  } finally {
    busy.value = null
  }
}

async function makeDefault(id: string) {
  reset()
  busy.value = { id, action: 'default' }
  try {
    emit('update', await setDefaultAddress(id, props.scenario))
    notice.value = 'Default address changed'
  } catch (error) {
    actionError.value = { title: 'Default address not changed', message: errorMessage(error) }
  } finally {
    busy.value = null
  }
}

const addButton =
  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-5 font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50'
</script>

<template>
  <section id="addresses" class="scroll-mt-24" aria-labelledby="addresses-title">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2
          id="addresses-title"
          ref="heading"
          tabindex="-1"
          class="text-xl font-semibold tracking-tight focus:outline-none lg:text-2xl"
        >
          Shipping addresses
        </h2>
        <p class="mt-1 text-muted-foreground">Pick one of these at checkout.</p>
      </div>
      <button
        v-if="!loading && list.length && editing !== 'new'"
        type="button"
        :disabled="locked"
        :class="addButton"
        @click="startAdd"
      >
        <AppIcon name="plus" :size="18" />
        Add address
      </button>
    </div>

    <p role="status" class="mt-4 text-sm font-medium text-success empty:hidden">{{ notice }}</p>

    <div
      v-if="actionError"
      role="alert"
      class="mt-4 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"
    >
      <AppIcon name="alert" class="mt-0.5 text-destructive" />
      <p>
        <span class="font-semibold">{{ actionError.title }}.</span>
        <span class="text-muted-foreground"> {{ actionError.message }} Try again.</span>
      </p>
    </div>

    <!-- Loading -->
    <ul v-if="loading" class="mt-8 grid gap-5 md:grid-cols-2" aria-hidden="true">
      <li v-for="n in 2" :key="n" class="h-64 rounded-xl border bg-card p-5">
        <div class="h-5 w-24 rounded bg-muted motion-safe:animate-pulse" />
        <div class="mt-8 space-y-3">
          <div class="h-4 w-3/4 rounded bg-muted motion-safe:animate-pulse" />
          <div class="h-4 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
          <div class="h-4 w-1/2 rounded bg-muted motion-safe:animate-pulse" />
        </div>
      </li>
    </ul>

    <!-- Empty -->
    <div
      v-else-if="!list.length && editing !== 'new'"
      class="mt-8 rounded-xl border-2 border-dashed px-6 py-12 text-center"
    >
      <AppIcon name="map-pin" :size="36" class="mx-auto text-muted-foreground" />
      <h3 class="mt-4 text-lg font-semibold">No saved addresses</h3>
      <p class="mx-auto mt-1 max-w-sm text-muted-foreground">
        Add an address now and checkout skips the typing.
      </p>
      <button type="button" :class="[addButton, 'mt-6']" @click="startAdd">
        <AppIcon name="plus" :size="18" />
        Add address
      </button>
    </div>

    <ul v-else class="mt-8 grid gap-5 md:grid-cols-2">
      <li v-if="editing === 'new'" class="md:col-span-2">
        <AccountAddressForm :scenario="scenario" @saved="onSaved" @cancel="editing = null" />
      </li>
      <li
        v-for="address in list"
        :key="address.id"
        :class="editing === address.id && 'md:col-span-2'"
      >
        <AccountAddressForm
          v-if="editing === address.id"
          :address="address"
          :scenario="scenario"
          @saved="onSaved"
          @cancel="editing = null"
        />
        <AccountAddressCard
          v-else
          class="h-full"
          :address="address"
          :busy="busy?.id === address.id ? busy.action : null"
          :locked="locked && busy?.id !== address.id"
          :confirming-delete="confirmingDelete === address.id"
          @edit="startEdit(address.id)"
          @request-delete="(reset(), (confirmingDelete = address.id))"
          @cancel-delete="confirmingDelete = null"
          @confirm-delete="remove(address.id)"
          @set-default="makeDefault(address.id)"
        />
      </li>
    </ul>
  </section>
</template>
