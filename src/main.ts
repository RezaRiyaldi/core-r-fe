import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'
import './style.css'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Skeleton from 'primevue/skeleton'
import ToggleSwitch from 'primevue/toggleswitch'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Breadcrumb from 'primevue/breadcrumb'
import Menu from 'primevue/menu'
import Paginator from 'primevue/paginator'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Chip from 'primevue/chip'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

const app = createApp(App)

const BlueAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
})

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: BlueAura,
    options: {
      darkModeSelector: '.dark',
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)

// Register globally
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Message', Message)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Dialog', Dialog)
app.component('Select', Select)
app.component('MultiSelect', MultiSelect)
app.component('Tag', Tag)
app.component('Badge', Badge)
app.component('Avatar', Avatar)
app.component('Skeleton', Skeleton)
app.component('ToggleSwitch', ToggleSwitch)
app.component('InputNumber', InputNumber)
app.component('Textarea', Textarea)
app.component('Breadcrumb', Breadcrumb)
app.component('Menu', Menu)
app.component('Paginator', Paginator)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Card', Card)
app.component('Divider', Divider)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Chip', Chip)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)

app.mount('#app')

