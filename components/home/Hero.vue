<script setup>
import { AreaChart, ArrowRight, ExternalLink } from 'lucide-vue-next'

const { title, description } = useAppConfig()
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="grid items-center gap-12 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <div class="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-full border border-red-200/50">
          <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          ShowTime 智能分发平台已上线
        </div>
        
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-gray-950 dark:text-gray-50 leading-[1.15]">
          让每一次登台与宣发<br>
          <span class="text-red-600">直达万千观众与粉丝</span>
        </h1>
        
        <p class="max-w-2xl mt-5 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ description }}。为演出门票、艺人周边商城、官方宣发物料提供毫秒级智能重定向与实时渠道转化分析。
        </p>

        <div class="flex flex-col gap-4 mt-8 sm:flex-row">
          <a
            href="/dashboard"
            class="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <AreaChart class="w-5 h-5 mr-2" />
            进入管理工作台
            <ArrowRight class="w-4 h-4 ml-2" />
          </a>
          <a
            href="https://ten.showtime.ing"
            target="_blank"
            class="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-800 dark:text-gray-100 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
          >
            艺人 TEN 周边直达
            <ExternalLink class="w-4 h-4 ml-2 text-gray-500" />
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 flex justify-center">
        <div class="relative w-full max-w-md p-6 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none">
          <div class="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <img
              src="/showtime-logo.png"
              :alt="title"
              class="w-full h-auto max-h-24 object-contain"
            >
          </div>
          <div class="mt-6 space-y-3">
            <div class="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>当前生效中专属通道</span>
              <span class="text-green-600 dark:text-green-400 font-bold">● 正常运行</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono">
              <span class="font-bold text-gray-800 dark:text-gray-200">ten.showtime.ing</span>
              <span class="text-xs text-gray-400">→ 有赞商城</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono">
              <span class="font-bold text-gray-800 dark:text-gray-200">go.showtime.ing</span>
              <span class="text-xs text-gray-400">→ 管理大盘</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
