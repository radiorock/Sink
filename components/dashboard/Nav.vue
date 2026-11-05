<script setup>
const route = useRoute()
const currentUser = ref(null)

const activeTab = computed(() => {
  // 保持与当前页面匹配
  if (route.path.startsWith('/dashboard/links'))
    return '/dashboard/links'
  if (route.path.startsWith('/dashboard/subdomains'))
    return '/dashboard/subdomains'
  if (route.path.startsWith('/dashboard/analysis'))
    return '/dashboard/analysis'
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
  <nav class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-2 border-b border-gray-100 dark:border-gray-800/60 mb-6">
    <Tabs
      v-if="route.path !== '/dashboard/link'"
      :model-value="activeTab"
      class="w-full md:w-auto overflow-x-auto pb-1"
      @update:model-value="handleTabChange"
    >
      <TabsList class="inline-flex h-10 items-center justify-start rounded-lg bg-gray-100 dark:bg-gray-800/80 p-1 text-gray-500 dark:text-gray-400 w-auto">
        <TabsTrigger
          value="/dashboard/links"
          class="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all"
        >
          短链管理
        </TabsTrigger>
        <TabsTrigger
          value="/dashboard/subdomains"
          class="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all"
        >
          专属二级域名
        </TabsTrigger>
        <TabsTrigger
          value="/dashboard/analysis"
          class="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all"
        >
          全站大盘
        </TabsTrigger>
        <TabsTrigger
          value="/dashboard/audit"
          class="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all"
        >
          操作审计记录
        </TabsTrigger>
        <TabsTrigger
          v-if="!currentUser || currentUser.role === 'admin'"
          value="/dashboard/users"
          class="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all"
        >
          成员与权限
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="flex items-center space-x-3 self-end md:self-auto">
      <div
        v-if="currentUser"
        class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/80 dark:border-gray-800 font-mono shadow-sm"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span class="font-medium">{{ currentUser.name }}</span>
        <span class="text-gray-400">({{ currentUser.role === 'admin' ? '总控管理员' : (currentUser.role === 'operator' ? '专属运营' : '只读观察') }})</span>
      </div>
      <slot name="left" />
      <div>
        <slot />
      </div>
    </div>
  </nav>
</template>
