<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, Copy, Printer } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { type ProjectAnalysisInput, type ProjectAnalysisReport, generateProjectReport } from '@/utils/project-analyzer'

const props = defineProps<{
  link?: any
}>()

const id = inject<any>('id', ref(''))
const slug = inject<any>('slug', ref(''))
const startAt = inject<any>('startAt', ref(0))
const endAt = inject<any>('endAt', ref(0))

const loading = ref(true)
const copied = ref(false)

const reportData = ref<ProjectAnalysisReport | null>(null)

async function loadAnalysisData() {
  loading.value = true
  try {
    const slugVal = props.link?.slug || slug.value || ''
    const idVal = props.link?.id || id.value || ''

    // 并行拉取 Counters、Views、Metrics (国家与渠道)
    const [countersRes, viewsRes, countriesRes, referersRes]: any = await Promise.all([
      useAPI('/api/stats/counters', {
        query: { slug: slugVal, id: idVal, startAt: startAt.value, endAt: endAt.value },
      }),
      useAPI('/api/stats/views', {
        query: { slug: slugVal, id: idVal, unit: 'day', startAt: startAt.value, endAt: endAt.value },
      }),
      useAPI('/api/stats/metrics', {
        query: { slug: slugVal, id: idVal, type: 'country', limit: 8, startAt: startAt.value, endAt: endAt.value },
      }),
      useAPI('/api/stats/metrics', {
        query: { slug: slugVal, id: idVal, type: 'referer', limit: 8, startAt: startAt.value, endAt: endAt.value },
      }),
    ])

    const counters = countersRes?.data?.[0] || countersRes?.[0] || { visits: 0, visitors: 0, referers: 0 }
    const views = viewsRes?.data || viewsRes || []
    const countries = countriesRes?.data || countriesRes || []
    const referers = referersRes?.data || referersRes || []

    const input: ProjectAnalysisInput = {
      slug: slugVal,
      title: props.link?.comment || props.link?.title || (slugVal ? `项目 ${slugVal}` : '全站运营大盘'),
      comment: props.link?.comment,
      url: props.link?.url,
      fullDomain: props.link?.slug ? `${props.link.slug}.showtime.ing` : 'ten.showtime.ing',
      createdAt: props.link?.createdAt,
      counters,
      views,
      countries,
      referers,
    }

    reportData.value = generateProjectReport(input)
  }
  catch (e) {
    console.error('Failed to generate project report:', e)
  }
  finally {
    loading.value = false
  }
}

watch([slug, id, startAt, endAt], loadAnalysisData, { immediate: true })

async function copyReport() {
  if (!reportData.value)
    return
  try {
    await navigator.clipboard.writeText(reportData.value.plainTextReport)
    copied.value = true
    toast.success('文字简报已复制到剪贴板，可直接发送')
    setTimeout(() => {
      copied.value = false
    }, 2500)
  }
  catch (e: any) {
    toast.error('复制失败，请手动选取文本', { description: e?.message })
  }
}

function printReport() {
  window.print()
}
</script>

<template>
  <div class="space-y-6 print:space-y-4">
    <!-- 顶部项目商业控制台头栏 -->
    <div class="rounded-lg border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-secondary text-secondary-foreground border border-border">
              {{ reportData?.projectMeta.slug ? `${reportData.projectMeta.slug.toUpperCase()} 专属通道` : '全站大盘' }}
            </span>
            <span class="text-xs text-muted-foreground font-mono">
              {{ reportData?.projectMeta.auditTimeRange }}
            </span>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-foreground mt-1.5">
            {{ reportData?.projectMeta.name }} · 运营数据分析简报
          </h2>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
            <span class="inline-flex items-center gap-1">
              目标承载:
              <span class="font-medium text-foreground">{{ reportData?.projectMeta.targetPlatform }}</span>
            </span>
            <span class="hidden sm:inline text-muted-foreground/40">|</span>
            <span class="inline-flex items-center gap-1">
              接入域名:
              <span class="font-mono text-foreground">{{ reportData?.projectMeta.boundDomain }}</span>
            </span>
          </div>
        </div>

        <!-- 汇报操作栏 -->
        <div class="flex items-center gap-2 print:hidden shrink-0">
          <Button
            variant="outline"
            size="sm"
            class="h-8.5 text-xs font-medium"
            :disabled="loading || !reportData"
            @click="copyReport"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            <Copy v-else class="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            {{ copied ? '已复制文字简报' : '复制文字简报' }}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            class="h-8.5 text-xs font-medium"
            :disabled="loading || !reportData"
            @click="printReport"
          >
            <Printer class="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            打印 / 导出 PDF
          </Button>
        </div>
      </div>

      <!-- 加载中骨架屏 -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
        <div v-for="i in 4" :key="i" class="rounded-md bg-muted/40 p-3.5 border border-border/40 space-y-2">
          <div class="h-3 w-16 bg-muted-foreground/20 rounded animate-pulse" />
          <div class="h-7 w-24 bg-muted-foreground/30 rounded animate-pulse" />
          <div class="h-2.5 w-20 bg-muted-foreground/15 rounded animate-pulse" />
        </div>
      </div>

      <!-- 核心指标摘要矩阵 (Executive KPI Grid) -->
      <div v-else-if="reportData" class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
        <div class="rounded-md bg-muted/40 p-3.5 border border-border/40">
          <div class="text-[11px] font-medium text-muted-foreground">
            总引流访问 (PV)
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-foreground mt-1">
            {{ reportData.executiveMetrics.totalVisits.toLocaleString() }}
          </div>
          <div class="text-[11px] text-muted-foreground mt-0.5">
            全网边缘真实跳转计数
          </div>
        </div>

        <div class="rounded-md bg-muted/40 p-3.5 border border-border/40">
          <div class="text-[11px] font-medium text-muted-foreground">
            独立触达受众 (UV)
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-foreground mt-1">
            {{ reportData.executiveMetrics.totalVisitors.toLocaleString() }}
          </div>
          <div class="text-[11px] text-muted-foreground mt-0.5">
            基于去重 IP 与设备画像
          </div>
        </div>

        <div class="rounded-md bg-muted/40 p-3.5 border border-border/40">
          <div class="text-[11px] font-medium text-muted-foreground">
            受众粘性指标
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-foreground mt-1">
            {{ reportData.executiveMetrics.visitsPerVisitor }}
            <span class="text-xs font-normal text-muted-foreground">次/人</span>
          </div>
          <div class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
            {{ reportData.executiveMetrics.stickinessLabel }}
          </div>
        </div>

        <div class="rounded-md bg-muted/40 p-3.5 border border-border/40">
          <div class="text-[11px] font-medium text-muted-foreground">
            首要核心客源地域
          </div>
          <div class="text-lg font-bold truncate text-foreground mt-1.5" :title="reportData.executiveMetrics.primaryRegionText">
            {{ reportData.executiveMetrics.primaryRegionText }}
          </div>
          <div class="text-[11px] text-muted-foreground mt-0.5">
            核心主力基本盘来源
          </div>
        </div>
      </div>
    </div>

    <!-- 业务维度结构化解读与管理建议 (加载骨架与渲染) -->
    <div v-if="loading" class="grid gap-6 md:grid-cols-2">
      <div v-for="i in 4" :key="i" class="rounded-lg border border-border/70 bg-card p-5 space-y-4">
        <div class="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
        <div class="h-10 w-full bg-muted-foreground/15 rounded animate-pulse" />
        <div class="space-y-2">
          <div class="h-3 w-full bg-muted-foreground/10 rounded animate-pulse" />
          <div class="h-3 w-3/4 bg-muted-foreground/10 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <div v-else-if="reportData" class="grid gap-6 md:grid-cols-2">
      <div
        v-for="sec in reportData.sections"
        :key="sec.id"
        class="rounded-lg border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between"
      >
        <div class="space-y-3.5">
          <div class="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h3 class="text-sm font-semibold tracking-tight text-foreground">
              {{ sec.category }}
            </h3>
            <span class="text-[11px] text-muted-foreground font-mono">
              模块 {{ String(sec.id).toUpperCase() }}
            </span>
          </div>

          <div class="text-xs font-medium text-foreground bg-secondary/50 p-2.5 rounded border border-border/30">
            结论概要: {{ sec.summary }}
          </div>

          <!-- 现状细节 -->
          <ul class="space-y-1.5 text-xs text-muted-foreground leading-relaxed pl-3.5 list-disc">
            <li v-for="(detail, idx) in sec.details" :key="idx">
              {{ detail }}
            </li>
          </ul>
        </div>

        <!-- 运营行动建议 (Actionable Recommendations) -->
        <div class="mt-4 pt-3.5 border-t border-border/40 bg-muted/20 -mx-5 -mb-5 p-4 rounded-b-lg">
          <div class="text-[11px] font-semibold tracking-tight text-foreground uppercase">
            管理与运营行动建议:
          </div>
          <ul class="mt-1.5 space-y-1 text-xs text-muted-foreground leading-relaxed pl-3.5 list-none">
            <li v-for="(act, idx) in sec.actionRecommendations" :key="idx" class="relative pl-3 before:content-['-'] before:absolute before:left-0 before:text-foreground/60">
              {{ act }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
