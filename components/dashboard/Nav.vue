<script setup>
import { Globe, LayoutDashboard, Link2, ShieldCheck, Users } from 'lucide-vue-next'

const route = useRoute()
const currentUser = ref(null)

const activeTab = computed(() => {
  if (route.path.startsWith('/dashboard/analysis'))
    return '/dashboard/analysis'
  if (route.path.startsWith('/dashboard/links') || route.path.startsWith('/dashboard/link'))
    return '/dashboard/links'
  if (route.path.startsWith('/dashboard/subdomains'))
    return '/dashboard/subdomains'
  if (route.path.startsWith('/dashboard/audit'))
    return '/dashboard/audit'
  if (route.path.startsWith('/dashboard/users'))
    return '/dashboard/users'
  return route.path
})

const navItems = computed(() => {
  const items = [
    { label: '全站大盘', path: '/dashboard/analysis', icon: LayoutDashboard },
    { label: '短链通道', path: '/dashboard/links', icon: Link2 },
    { label: '专属域名', path: '/dashboard/subdomains', icon: Globe },
    { label: '操作审计', path: '/dashboard/audit', icon: ShieldCheck },
  ]
  if (!currentUser.value || currentUser.value.role === 'admin') {
    items.push({ label: '团队成员', path: '/dashboard/users', icon: Users })
  }
  return items
})

onMounted(async () => {
  try {
    const res = await useAPI('/api/user/current')
    currentUser.value = res
  }
  catch {
    // 静默忽略
  }
})
</script>

<template>
  <nav class="border-b border-gray-200 dark:border-gray-800 mb-6">
    <div class="flex items-center space-x-6 sm:space-x-8 overflow-x-auto -mb-px">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="inline-flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap"
        :class="activeTab === item.path
          ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-500 font-semibold'
          : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'"
      >
        <component :is="item.icon" class="w-4 h-4 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
