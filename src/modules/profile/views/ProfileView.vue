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
  <div class="profile-page">
    <PageHeader :title="t('profile.title')" :description="t('profile.pageDescription')" />

    <div class="profile-content-layout">
      <section class="profile-identity">
        <Avatar :label="auth.user?.name?.charAt(0).toUpperCase()" shape="circle" class="profile-identity-avatar" />
        <div class="min-w-0 flex-1">
          <p class="profile-identity-kicker">{{ t('profile.accountLabel') }}</p>
          <h2 class="truncate">{{ auth.user?.name }}</h2>
          <p class="truncate">{{ auth.user?.email }}</p>
        </div>
        <span class="profile-secure-badge"><i class="pi pi-shield" /> {{ t('profile.secureAccount') }}</span>
        <RouterLink to="/tokens" class="profile-token-link"><i class="pi pi-key" /> {{ t('nav.tokens') }} <i class="pi pi-arrow-up-right" /></RouterLink>
      </section>

      <div class="profile-forms">
      <section class="profile-form-card">
        <header class="profile-form-heading">
          <span class="profile-form-icon"><i class="pi pi-user-edit" /></span>
          <div><h2>{{ t('profile.editProfile') }}</h2><p>{{ t('profile.profileHint') }}</p></div>
        </header>
        <div class="profile-form-body">
          <div class="form-field">
            <label class="form-label required">{{ t('common.name') }}</label>
            <InputText v-model="profileForm.name" class="w-full" required />
          </div>
          <p v-if="profileError" class="text-sm text-red-500">{{ profileError }}</p>
          <div class="profile-form-footer"><Button :label="t('common.save')" icon="pi pi-check" :loading="store.saving" @click="saveProfile" /></div>
        </div>
      </section>

      <section class="profile-form-card">
        <header class="profile-form-heading">
          <span class="profile-form-icon password-icon"><i class="pi pi-lock" /></span>
          <div><h2>{{ t('profile.changePassword') }}</h2><p>{{ t('profile.passwordHint') }}</p></div>
        </header>
        <div class="profile-form-body">
          <div class="form-field">
            <label class="form-label required">{{ t('profile.currentPassword') }}</label>
            <Password v-model="passwordForm.current_password" :feedback="false" toggle-mask class="w-full" input-class="w-full" required />
            <p v-if="passwordErrors.current_password" class="text-xs text-red-500">{{ passwordErrors.current_password }}</p>
          </div>
          <div class="form-field">
            <label class="form-label required">{{ t('users.password') }}</label>
            <Password v-model="passwordForm.password" toggle-mask class="w-full" input-class="w-full" required />
            <p v-if="passwordErrors.password" class="text-xs text-red-500">{{ passwordErrors.password }}</p>
          </div>
          <div class="form-field">
            <label class="form-label required">{{ t('users.passwordConfirmation') }}</label>
            <Password v-model="passwordForm.password_confirmation" :feedback="false" toggle-mask class="w-full" input-class="w-full" required />
            <p v-if="passwordErrors.password_confirmation" class="text-xs text-red-500">{{ passwordErrors.password_confirmation }}</p>
          </div>
          <p v-if="passwordServerError" class="text-sm text-red-500">{{ passwordServerError }}</p>
          <div class="profile-form-footer"><Button :label="t('profile.changePassword')" icon="pi pi-key" :loading="store.changingPassword" @click="savePassword" /></div>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>
