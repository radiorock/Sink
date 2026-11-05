<script setup>
import { ArrowLeft, FileText, LayoutDashboard } from 'lucide-vue-next'

const route = useRoute()
const slugParam = computed(() => route.query.slug || '')

const link = ref({})
const id = computed(() => link.value.id)
const currentSlug = computed(() => link.value.slug || slugParam.value)

// 视图模式：默认运营简报 ('briefing')，支持随时切换到趋势看板 ('metrics')
const viewMode = ref('briefing')

provide('id', id)
provide('slug', currentSlug)

async function getLink() {
  const data = await useAPI('/api/link/query', {
    query: {
      slug: slugParam.value,
    },
  })
  link.value = data || {}
}

function updateLink(newLink, type) {
  if (type === 'delete') {
    navigateTo('/dashboard/links', {
      replace: true,
    })
  }
  else if (newLink) {
    link.value = newLink
  }
}

onMounted(() => {
  getLink()
})
</script>

<template>
  <main class="space-y-6">
    <!-- 顶部返回通道与当前对象标头 -->
    <div class="flex items-center justify-between pb-3 border-b border-border/70">
      <NuxtLink
        to="/dashboard/links"
        class="inline-flex items-center text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
        返回短链通道
      </NuxtLink>
      <div v-if="link.slug" class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">当前短链:</span>
        <span class="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">/{{ link.slug }}</span>
      </div>
    </div>

    <DashboardLinksLink
      v-if="link.id"
      :link="link"
      @update:link="updateLink"
    />

    <!-- 视图视角切换器 (运营简报 vs 趋势看板) -->
    <div v-if="link.id" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
      <div class="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground w-fit">
        <button
          type="button"
          class="inline-flex items-center px-3.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer"
          :class="viewMode === 'briefing' ? 'bg-background text-foreground shadow-xs font-semibold' : 'hover:text-foreground'"
          @click="viewMode = 'briefing'"
        >
          <FileText class="w-3.5 h-3.5 mr-1.5" />
          运营简报
        </button>
        <button
          type="button"
          class="inline-flex items-center px-3.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer"
          :class="viewMode === 'metrics' ? 'bg-background text-foreground shadow-xs font-semibold' : 'hover:text-foreground'"
          @click="viewMode = 'metrics'"
        >
          <LayoutDashboard class="w-3.5 h-3.5 mr-1.5" />
          趋势看板
        </button>
      </div>

      <span class="text-xs text-muted-foreground">
        当前通道: <span class="font-mono text-foreground font-semibold">{{ link.slug }}</span>
      </span>
    </div>

    <!-- 视角 1: 运营简报 -->
    <DashboardProjectBriefing
      v-if="link.id && viewMode === 'briefing'"
      :link="link"
    />

    <!-- 视角 2: 趋势看板 -->
    <Dashboard
      v-if="link.id && viewMode === 'metrics'"
      :link="link"
    />
  </main>
</template>
