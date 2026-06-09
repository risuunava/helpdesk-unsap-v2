import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Mahasiswa',
    items: [
      {
        title: 'Dashboard',
        url: '/mahasiswa',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Buat Laporan',
        url: '/mahasiswa/submit',
        icon: 'add',
        isActive: false,
        shortcut: ['n', 'n'],
        items: []
      }
    ]
  },
  {
    label: 'Administrator',
    items: [
      {
        title: 'Admin Overview',
        url: '/admin',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['a', 'a'],
        items: [],
        access: { role: 'admin' }
      },
      {
        title: 'Analytics',
        url: '/admin/analytics',
        icon: 'trendingUp',
        isActive: false,
        items: [],
        access: { role: 'admin' }
      },
      {
        title: 'ML Management',
        url: '/admin/ml',
        icon: 'kanban',
        isActive: false,
        items: [],
        access: { role: 'admin' }
      }
    ]
  },
  {
    label: 'Sistem',
    items: [
      {
        title: 'Account',
        url: '#',
        icon: 'user',
        isActive: true,
        items: [
          {
            title: 'Notifications',
            url: '/mahasiswa', // placeholder
            icon: 'notification'
          },
          {
            title: 'Settings',
            url: '/mahasiswa', // placeholder
            icon: 'settings'
          }
        ]
      }
    ]
  }
];
