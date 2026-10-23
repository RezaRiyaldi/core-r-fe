export interface NavItem {
  key: string
  labelKey: string // kunci i18n
  icon: string
  to: string
  permission?: string // kosong = semua user terautentikasi bisa akses
  children?: NavItem[]
}

export const navigation: NavItem[] = [
  {
    key: 'dashboard',
    labelKey: 'nav.dashboard',
    icon: 'pi pi-home',
    to: '/',
  },
  {
    key: 'users',
    labelKey: 'nav.users',
    icon: 'pi pi-users',
    to: '/users',
    permission: 'users.view',
  },
  {
    key: 'roles',
    labelKey: 'nav.roles',
    icon: 'pi pi-shield',
    to: '/roles',
    permission: 'roles.view',
  },
  {
    key: 'permissions',
    labelKey: 'nav.permissions',
    icon: 'pi pi-lock',
    to: '/permissions',
    permission: 'permissions.view',
  },
  {
    key: 'settings',
    labelKey: 'nav.settings',
    icon: 'pi pi-cog',
    to: '/settings',
    permission: 'settings.view',
  },
  {
    key: 'notifications',
    labelKey: 'nav.notifications',
    icon: 'pi pi-bell',
    to: '/notifications',
    permission: 'notifications.view',
  },
  {
    key: 'audit',
    labelKey: 'nav.audit',
    icon: 'pi pi-list',
    to: '/audit',
    permission: 'audit.view',
  },
]
