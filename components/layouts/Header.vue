<script setup>
import { Ellipsis, X } from 'lucide-vue-next'
import SwitchTheme from '../SwitchTheme.vue'

const route = useRoute()
const showMenu = ref(false)
const { title } = useAppConfig()

const isDashboard = computed(() => route.path.startsWith('/dashboard') && route.path !== '/dashboard/login')
const currentUser = ref(null)

const displayName = computed(() => {
  if (!currentUser.value?.name)
    return ''
  const match = currentUser.value.name.match(/\((.*?)\)|（(.*?)）/)
  if (match) {
    return match[1] || match[2]
  }
  return currentUser.value.name
})

const roleLabel = computed(() => {
  if (!currentUser.value?.role)
    return ''
  const roleMap = {
    admin: '总控管理员',
    operator: '专属运营',
    viewer: '只读观察',
  }
  return roleMap[currentUser.value.role] || currentUser.value.role
})

async function fetchCurrentUser() {
  if (isDashboard.value) {
    try {
      const res = await useAPI('/api/user/current')
      currentUser.value = res
    }
    catch {
      currentUser.value = null
    }
  }
}

onMounted(() => {
  fetchCurrentUser()
})

watch(() => route.path, () => {
  fetchCurrentUser()
  showMenu.value = false
})
</script>

<template>
  <section class="pb-2">
    <nav class="container relative z-50 h-16 select-none">
      <div
        class="container relative flex flex-wrap items-center justify-between h-16 px-0 mx-auto overflow-hidden font-medium border-b border-gray-200 dark:border-gray-800 md:overflow-visible"
      >
        <div class="flex items-center justify-start h-full pr-4">
          <a
            href="/"
            :title="title"
            class="flex items-center transition-opacity hover:opacity-85"
          >
            <img
              src="/showtime-logo.png"
              :alt="title"
              class="h-7 md:h-8 w-auto object-contain dark:hidden"
            >
            <img
              src="/showtime-logo-dark.png"
              :alt="title"
              class="h-7 md:h-8 w-auto object-contain hidden dark:block"
            >
          </a>
          <template v-if="isDashboard">
            <span class="text-gray-300 dark:text-gray-700 font-light mx-2 text-sm hidden sm:inline">/</span>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline tracking-wide">管理工作台</span>
          </template>
        </div>

        <div
          class="top-0 left-0 items-start w-full h-full p-4 text-sm bg-gray-900 bg-opacity-50 md:items-center md:w-auto md:absolute md:right-0 lg:text-base md:bg-transparent md:p-0 md:relative md:flex"
          :class="{ 'flex fixed': showMenu, 'hidden': !showMenu }"
          @touchmove.prevent
        >
          <div
            class="flex-col w-full h-auto overflow-hidden rounded-lg bg-background md:overflow-visible md:rounded-none md:relative md:flex md:flex-row md:items-center md:space-x-4"
          >
            <a
              href="/"
              :title="title"
              class="inline-flex items-center w-auto h-16 px-4 md:hidden transition-opacity hover:opacity-85"
            >
              <img
                src="/showtime-logo.png"
                :alt="title"
                class="h-7 w-auto object-contain dark:hidden"
              >
              <img
                src="/showtime-logo-dark.png"
                :alt="title"
                class="h-7 w-auto object-contain hidden dark:block"
              >
            </a>
            <div
              class="flex flex-col items-start justify-end w-full pt-4 md:items-center md:flex-row md:py-0 md:space-x-3 gap-2 md:gap-0"
            >
              <!-- 处于工作台时的全局操作区 -->
              <template v-if="isDashboard">
                <div
                  v-if="currentUser"
                  class="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200/80 dark:border-gray-700 font-mono shadow-xs"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span class="font-semibold">{{ displayName }}</span>
                  <span class="text-gray-400 dark:text-gray-500">·</span>
                  <span class="text-gray-500 dark:text-gray-400">{{ roleLabel }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <SwitchTheme />
                  <DashboardLogout />
                </div>
              </template>

              <!-- 非工作台页面（官网首页） -->
              <template v-else>
                <a
                  class="w-full px-4 py-2 font-semibold text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:text-red-400 cursor-pointer md:w-auto transition-colors"
                  href="/dashboard"
                  title="管理工作台"
                >管理工作台</a>
                <span class="mt-2 md:mt-0">
                  <SwitchTheme />
                </span>
              </template>
            </div>
          </div>
        </div>

        <div
          class="absolute right-0 flex flex-col items-center justify-center w-10 h-10 rounded-full cursor-pointer md:hidden hover:bg-muted"
          :class="{ 'right-2': showMenu }"
          @click="showMenu = !showMenu"
        >
          <Ellipsis
            v-show="!showMenu"
            class="w-6 h-6"
          />
          <X
            v-show="showMenu"
            class="w-6 h-6"
          />
        </div>
      </div>
    </nav>
  </section>
</template>
