<script setup>
const route = useRoute()
const currentUser = ref(null)

onMounted(async () => {
  try {
    const res = await useAPI('/api/user/current')
    currentUser.value = res
  }
  catch (e) {
    // 静默忽略
  }
})
</script>

<template>
  <nav class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <Tabs
      v-if="route.path !== '/dashboard/link'"
      :default-value="route.path"
      class="w-full md:w-auto overflow-x-auto pb-1"
      @update:model-value="navigateTo"
    >
      <TabsList class="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-auto">
        <TabsTrigger
          value="/dashboard/links"
          class="px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          短链管理
        </TabsTrigger>
        <TabsTrigger
          value="/dashboard/subdomains"
          class="px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          专属二级域名
        </TabsTrigger>
        <TabsTrigger
          value="/dashboard/analysis"
          class="px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          全站大盘
        </TabsTrigger>
        <TabsTrigger
          value="/dashboard/audit"
          class="px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          操作审计记录
        </TabsTrigger>
        <TabsTrigger
          v-if="!currentUser || currentUser.role === 'admin'"
          value="/dashboard/users"
          class="px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          成员与权限
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="flex items-center space-x-3 self-end md:self-auto">
      <div
        v-if="currentUser"
        class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 font-mono"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span>{{ currentUser.name }}</span>
        <span class="text-gray-400">({{ currentUser.role === 'admin' ? '总控' : (currentUser.role === 'operator' ? '运营' : '只读') }})</span>
      </div>
      <slot name="left" />
      <div>
        <slot />
      </div>
    </div>
  </nav>
</template>
