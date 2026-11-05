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

onMounted(async () => {
  try {
    const res = await useAPI('/api/user/current')
    currentUser.value = res
  }
  catch {
    // 静默忽略
  }
})

function handleTabChange(val) {
  if (val && val !== route.path) {
    navigateTo(val)
  }
}
</script>

<template>
  <nav class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-3 border-b border-gray-200/80 dark:border-gray-800/80 mb-6">
    <Tabs
      :model-value="activeTab"
      class="w-full md:w-auto overflow-x-auto"
      @update:model-value="handleTabChange"
    >
      <TabsList class="inline-flex h-10 items-center justify-start rounded-lg bg-gray-100 dark:bg-gray-800/80 p-1 text-gray-500 dark:text-gray-400 w-auto">
        <!-- 1. 全站大盘 -->
        <TabsTrigger
          value="/dashboard/analysis"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          <LayoutDashboard class="w-3.5 h-3.5 shrink-0" />
          全站大盘
        </TabsTrigger>

        <!-- 2. 短链通道 -->
        <TabsTrigger
          value="/dashboard/links"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          <Link2 class="w-3.5 h-3.5 shrink-0" />
          短链通道
        </TabsTrigger>

        <!-- 3. 专属域名 -->
        <TabsTrigger
          value="/dashboard/subdomains"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          <Globe class="w-3.5 h-3.5 shrink-0" />
          专属域名
        </TabsTrigger>

        <!-- 4. 操作审计 -->
        <TabsTrigger
          value="/dashboard/audit"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          <ShieldCheck class="w-3.5 h-3.5 shrink-0" />
          操作审计
        </TabsTrigger>

        <!-- 5. 团队成员 -->
        <TabsTrigger
          v-if="!currentUser || currentUser.role === 'admin'"
          value="/dashboard/users"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          <Users class="w-3.5 h-3.5 shrink-0" />
          团队成员
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="flex items-center space-x-2.5 self-end md:self-auto">
      <slot name="left" />
      <slot />
    </div>
  </nav>
</template>
