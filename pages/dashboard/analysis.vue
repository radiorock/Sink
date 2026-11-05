<script setup>
import { FileText, LayoutDashboard } from 'lucide-vue-next'

provide('id', ref(''))
provide('slug', ref(''))

const viewMode = ref('briefing')
</script>

<template>
  <main class="space-y-6">
    <!-- 常驻主导航 -->
    <DashboardNav />

    <!-- 视图视角切换器 (运营简报 vs 趋势大盘) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
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
          趋势大盘
        </button>
      </div>

      <span class="text-xs text-muted-foreground">
        统计维度: <span class="font-medium text-foreground">全站汇总</span>
      </span>
    </div>

    <!-- 视角 1: 运营简报 -->
    <DashboardProjectBriefing
      v-if="viewMode === 'briefing'"
    />

    <!-- 视角 2: 趋势大盘 -->
    <Dashboard
      v-if="viewMode === 'metrics'"
    />
  </main>
</template>
