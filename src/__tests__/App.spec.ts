import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '../App.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

describe('App', () => {
  it('mounts without errors', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
        stubs: { Toast: true, ConfirmDialog: true },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
