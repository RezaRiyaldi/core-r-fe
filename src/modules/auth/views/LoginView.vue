<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
    if (axiosError.response?.status === 422 || axiosError.response?.status === 401) {
      error.value = axiosError.response.data?.message ?? t('auth.invalidCredentials')
    } else {
      toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
    }
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-8">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-surface-900">{{ t('app.name') }}</h1>
      </div>

      <div class="rounded-xl bg-white p-6 shadow sm:p-8">
        <form @submit.prevent="submit" novalidate>
          <div class="mb-4">
            <label for="email" class="mb-1 block text-sm font-medium text-surface-700 required">
              {{ t('auth.email') }}
            </label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              class="w-full"
              :disabled="auth.loading"
              required
            />
          </div>

          <div class="mb-6">
            <label for="password" class="mb-1 block text-sm font-medium text-surface-700 required">
              {{ t('auth.password') }}
            </label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              inputClass="w-full"
              class="w-full"
              :disabled="auth.loading"
              required
            />
          </div>

          <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

          <Button
            type="submit"
            :label="t('auth.loginButton')"
            class="w-full"
            :loading="auth.loading"
          />
        </form>
      </div>
    </div>
  </div>
</template>
