import { createI18n } from 'vue-i18n'
import id from './locales/id'
import en from './locales/en'

export const i18n = createI18n({
  legacy: false,
  locale: 'id',
  fallbackLocale: 'en',
  messages: { id, en },
})
