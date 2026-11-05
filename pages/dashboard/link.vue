<script setup>
import { FileText, LayoutDashboard } from 'lucide-vue-next'

const route = useRoute()
const slugParam = computed(() => route.query.slug || '')

const link = ref({})
const id = computed(() => link.value.id)
const currentSlug = computed(() => link.value.slug || slugParam.value)

// 视图模式：默认高管商业解读专报 ('briefing')，支持随时切换到底层原始看板 ('metrics')
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
    <DashboardBreadcrumb title="短链详情" />
    <DashboardLinksLink
      v-if="link.id"
      :link="link"
      @update:link="updateLink"
    />

    <!-- 视图视角切换器 (高管运营解读专报 vs 底层时序看板) -->
    <div v-if="link.id" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
      <div class="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground w-fit">
        <button
          type="button"
          class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer"
          :class="viewMode === 'briefing' ? 'bg-background text-foreground shadow-xs font-semibold' : 'hover:text-foreground'"
          @click="viewMode = 'briefing'"
        >
          <FileText class="w-3.5 h-3.5 mr-1.5" />
          项目商业解读专报 (高管/运营视角)
        </button>
        <button
          type="button"
          class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer"
          :class="viewMode === 'metrics' ? 'bg-background text-foreground shadow-xs font-semibold' : 'hover:text-foreground'"
          @click="viewMode = 'metrics'"
        >
          <LayoutDashboard class="w-3.5 h-3.5 mr-1.5" />
          底层指标与时序看板
        </button>
      </div>

      <span class="text-xs text-muted-foreground">
        当前分析对象: <span class="font-mono text-foreground font-semibold">{{ link.slug }}</span>
      </span>
    </div>

    <!-- 视角 1: 项目专属商业解读专报 (根据该项目数据纯本地规则生成) -->
    <DashboardProjectBriefing
      v-if="link.id && viewMode === 'briefing'"
      :link="link"
    />

    <!-- 视角 2: 底层原始指标看板 (折线图/渠道列表/省份画像) -->
    <Dashboard
      v-if="link.id && viewMode === 'metrics'"
      :link="link"
    />
  </main>
</template>
