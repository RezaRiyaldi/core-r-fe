<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const store = useProfileStore()

// Profile form
const profileForm = ref({ name: auth.user?.name ?? '' })
const profileError = ref('')

// Password form
const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' })
const passwordErrors = ref<Record<string, string>>({})
const passwordServerError = ref('')

onMounted(() => {
  profileForm.value.name = auth.user?.name ?? ''
})

async function saveProfile() {
  profileError.value = ''
  try {
    await store.updateProfile(profileForm.value.name)
    toast.add({ severity: 'success', summary: t('profile.savedSuccess'), life: 3000 })
  } catch {
    profileError.value = t('common.error')
  }
}

async function savePassword() {
  passwordErrors.value = {}
  passwordServerError.value = ''
  try {
    await store.changePassword(
      passwordForm.value.current_password,
      passwordForm.value.password,
      passwordForm.value.password_confirmation,
    )
    toast.add({ severity: 'success', summary: t('profile.passwordChanged'), life: 3000 })
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } }
    if (e.response?.status === 422 && e.response.data?.errors) {
      Object.entries(e.response.data.errors).forEach(([k, v]) => {
        passwordErrors.value[k] = v[0] ?? ''
      })
    } else {
      passwordServerError.value = e.response?.data?.message ?? t('common.error')
    }
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('profile.title')" :description="auth.user?.email ?? ''" />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 max-w-3xl">
      <!-- Profile info -->
      <div class="rounded-lg border border-surface-200 bg-white p-6">
        <h2 class="mb-4 text-base font-semibold text-surface-800">{{ t('profile.editProfile') }}</h2>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">{{ t('common.name') }}</label>
            <InputText v-model="profileForm.name" class="w-full" />
          </div>
          <p v-if="profileError" class="text-sm text-red-500">{{ profileError }}</p>
          <Button :label="t('common.save')" :loading="store.saving" @click="saveProfile" />
        </div>
      </div>

      <!-- Change password -->
      <div class="rounded-lg border border-surface-200 bg-white p-6">
        <h2 class="mb-4 text-base font-semibold text-surface-800">{{ t('profile.changePassword') }}</h2>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">{{ t('profile.currentPassword') }}</label>
            <Password v-model="passwordForm.current_password" :feedback="false" toggle-mask class="w-full" input-class="w-full" />
            <p v-if="passwordErrors.current_password" class="text-xs text-red-500">{{ passwordErrors.current_password }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">{{ t('users.password') }}</label>
            <Password v-model="passwordForm.password" toggle-mask class="w-full" input-class="w-full" />
            <p v-if="passwordErrors.password" class="text-xs text-red-500">{{ passwordErrors.password }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">{{ t('users.passwordConfirmation') }}</label>
            <Password v-model="passwordForm.password_confirmation" :feedback="false" toggle-mask class="w-full" input-class="w-full" />
            <p v-if="passwordErrors.password_confirmation" class="text-xs text-red-500">{{ passwordErrors.password_confirmation }}</p>
          </div>
          <p v-if="passwordServerError" class="text-sm text-red-500">{{ passwordServerError }}</p>
          <Button :label="t('profile.changePassword')" :loading="store.changingPassword" @click="savePassword" />
        </div>
      </div>
    </div>
  </div>
</template>
