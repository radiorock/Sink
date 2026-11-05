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

    <!-- 页面标题与视角切换工具栏 (Page Header) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
      <div>
        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          全站大盘
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          全站综合运营态势、渠道引流漏斗与访客地域时序看板
        </p>
      </div>

      <!-- 视图视角切换器 (运营简报 vs 趋势大盘) -->
      <div class="inline-flex h-9 items-center rounded-lg bg-gray-100 dark:bg-gray-800/80 p-1 text-gray-500 dark:text-gray-400 w-fit">
        <button
          type="button"
          class="inline-flex items-center px-3.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer"
          :class="viewMode === 'briefing' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold' : 'hover:text-gray-900 dark:hover:text-gray-100'"
          @click="viewMode = 'briefing'"
        >
          <FileText class="w-3.5 h-3.5 mr-1.5" />
          运营简报
        </button>
        <button
          type="button"
          class="inline-flex items-center px-3.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer"
          :class="viewMode === 'metrics' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold' : 'hover:text-gray-900 dark:hover:text-gray-100'"
          @click="viewMode = 'metrics'"
        >
          <LayoutDashboard class="w-3.5 h-3.5 mr-1.5" />
          趋势大盘
        </button>
      </div>
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
