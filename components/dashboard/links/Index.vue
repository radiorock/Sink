<script setup>
import { Loader, Search, Tag } from 'lucide-vue-next'
import { useInfiniteScroll } from '@vueuse/core'

const links = ref([])
const limit = 24
let cursor = ''
let listComplete = false
const activeTag = ref('all')
const searchQuery = ref('')

async function getLinks(reset = false) {
  if (reset) {
    cursor = ''
    listComplete = false
    links.value = []
  }
  const data = await useAPI('/api/link/list', {
    query: {
      limit,
      cursor,
    },
  })
  const newItems = (data.links || []).filter(Boolean)
  links.value = reset ? newItems : links.value.concat(newItems).filter(Boolean)
  cursor = data.cursor || ''
  listComplete = data.list_complete
}

const { isLoading } = useInfiniteScroll(
  document,
  () => getLinks(false),
  { distance: 150, interval: 1000, canLoadMore: () => !listComplete },
)

function updateLinkList(link, type) {
  if (type === 'edit') {
    const index = links.value.findIndex(l => l.id === link.id)
    if (index !== -1) {
      links.value[index] = link
    }
  }
  else if (type === 'delete') {
    const index = links.value.findIndex(l => l.id === link.id)
    if (index !== -1) {
      links.value.splice(index, 1)
    }
  }
  else {
    links.value.unshift(link)
  }
}

// 提取当前所有短链中出现过的唯一标签
const availableTags = computed(() => {
  const set = new Set()
  for (const l of links.value) {
    if (Array.isArray(l.tags)) {
      l.tags.forEach(t => t && set.add(t))
    }
  }
  return Array.from(set)
})

// 过滤后的短链列表
const filteredLinks = computed(() => {
  const now = Math.floor(Date.now() / 1000)
  const q = searchQuery.value.trim().toLowerCase()

  return links.value.filter((l) => {
    // 标签匹配
    if (activeTag.value === 'expired') {
      if (!l.expiration || l.expiration >= now)
        return false
    }
    else if (activeTag.value === 'active') {
      if (l.expiration && l.expiration < now)
        return false
    }
    else if (activeTag.value !== 'all') {
      if (!Array.isArray(l.tags) || !l.tags.includes(activeTag.value))
        return false
    }

    // 搜索词匹配
    if (q) {
      const matchSlug = l.slug?.toLowerCase().includes(q)
      const matchUrl = l.url?.toLowerCase().includes(q)
      const matchComment = l.comment?.toLowerCase().includes(q)
      const matchTags = Array.isArray(l.tags) && l.tags.some(t => t.toLowerCase().includes(q))
      return matchSlug || matchUrl || matchComment || matchTags
    }

    return true
  })
})
</script>

<template>
  <main class="space-y-6">
    <DashboardNav />

    <!-- 页面标题与操作栏 (Page Header) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
      <div>
        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          短链通道
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          查看、创建并维护全站宣发引流短链通道及实时重定向策略
        </p>
      </div>

      <div class="flex items-center gap-2">
        <DashboardLinksBulkGenerator @refresh="() => getLinks(true)" />
        <DashboardLinksEditor @update:link="updateLinkList" />
      </div>
    </div>

    <!-- 检索与标签快速筛选栏 -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
      <div class="relative flex-1 max-w-sm">
        <Search class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="快速搜索短链后缀、目标地址或备注..."
          class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-red-600"
        >
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
          :class="activeTag === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'"
          @click="activeTag = 'all'"
        >
          全部 ({{ links.length }})
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
          :class="activeTag === 'active' ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'"
          @click="activeTag = 'active'"
        >
          有效通道
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
          :class="activeTag === 'expired' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'"
          @click="activeTag = 'expired'"
        >
          已截止
        </button>

        <!-- 业务项目标签动态列表 -->
        <button
          v-for="tag in availableTags"
          :key="tag"
          type="button"
          class="px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1"
          :class="activeTag === tag ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'"
          @click="activeTag = tag"
        >
          <Tag class="w-3 h-3" />
          <span>{{ tag }}</span>
        </button>
      </div>
    </div>

    <!-- 短链卡片网格 -->
    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DashboardLinksLink
        v-for="link in filteredLinks"
        :key="link.id"
        :link="link"
        @update:link="updateLinkList"
      />
    </section>

    <div
      v-if="filteredLinks.length === 0 && !isLoading"
      class="text-center py-12 text-sm text-gray-400 dark:text-gray-600"
    >
      暂无符合筛选条件的短链通道
    </div>

    <div
      v-if="isLoading"
      class="flex items-center justify-center py-4"
    >
      <Loader class="animate-spin text-gray-400" />
    </div>

    <div
      v-if="!isLoading && listComplete && filteredLinks.length > 0"
      class="flex items-center justify-center text-xs text-gray-400 py-2"
    >
      已加载全部短链 (共 {{ links.length }} 条)
    </div>
  </main>
</template>
