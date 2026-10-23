<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useUsersStore } from '../store'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  created: []
}>()

const { t } = useI18n()
const toast = useToast()
const store = useUsersStore()

const submitting = ref(false)
const serverError = ref('')
const fieldErrors = reactive<Record<string, string>>({})

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

function reset() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.password_confirmation = ''
  serverError.value = ''
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
}

function close() {
  reset()
  emit('update:visible', false)
}

async function submit() {
  serverError.value = ''
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  submitting.value = true
  try {
    await store.createUser({ ...form })
    toast.add({ severity: 'success', summary: t('users.createdSuccess'), life: 3000 })
    emit('created')
    reset()
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
    }
    if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
      const errs = axiosErr.response.data.errors
      Object.entries(errs).forEach(([field, msgs]) => {
        fieldErrors[field] = msgs[0] ?? ''
      })
    } else {
      serverError.value = axiosErr.response?.data?.message ?? t('common.error')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="t('users.createTitle')"
    :style="{ width: '32rem' }"
    :modal="true"
    :closable="!submitting"
    @update:visible="close"
  >
    <form @submit.prevent="submit" novalidate class="flex flex-col gap-4">
      <Message v-if="serverError" severity="error" :closable="false">{{ serverError }}</Message>

      <div>
        <label class="mb-1 block text-sm font-medium text-surface-700 required">{{ t('common.name') }}</label>
        <InputText v-model="form.name" class="w-full" :disabled="submitting" required />
        <small v-if="fieldErrors.name" class="text-red-500">{{ fieldErrors.name }}</small>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-surface-700 required">{{ t('common.email') }}</label>
        <InputText v-model="form.email" type="email" class="w-full" :disabled="submitting" required />
        <small v-if="fieldErrors.email" class="text-red-500">{{ fieldErrors.email }}</small>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-surface-700 required">{{ t('users.password') }}</label>
        <Password
          v-model="form.password"
          :feedback="false"
          toggleMask
          inputClass="w-full"
          class="w-full"
          :disabled="submitting"
          required
        />
        <small v-if="fieldErrors.password" class="text-red-500">{{ fieldErrors.password }}</small>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-surface-700 required">{{ t('users.passwordConfirmation') }}</label>
        <Password
          v-model="form.password_confirmation"
          :feedback="false"
          toggleMask
          inputClass="w-full"
          class="w-full"
          :disabled="submitting"
          required
        />
        <small v-if="fieldErrors.password_confirmation" class="text-red-500">{{ fieldErrors.password_confirmation }}</small>
      </div>
    </form>

    <template #footer>
      <Button :label="t('common.cancel')" text severity="secondary" :disabled="submitting" @click="close" />
      <Button :label="t('common.save')" :loading="submitting" @click="submit" />
    </template>
  </Dialog>
</template>
