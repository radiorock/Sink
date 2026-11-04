<script setup>
import { AreaChart, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-vue-next'

const { title, description } = useAppConfig()
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="grid items-center gap-12 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <div class="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-full border border-red-200/50">
          <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          ShowTime 智能分发服务平台
        </div>
        
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-gray-950 dark:text-gray-50 leading-[1.15]">
          让每一次登台与宣发<br>
          <span class="text-red-600">直达万千观众与粉丝</span>
        </h1>
        
        <p class="max-w-2xl mt-5 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ description }}。为演出门票、演出周边、官方宣发物料提供毫秒级智能重定向与实时渠道转化分析。
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
        </div>
      </div>

      <div class="lg:col-span-5 flex justify-center">
        <div class="relative w-full max-w-md p-6 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none">
          <div class="flex items-center justify-center p-8 bg-gray-50/60 dark:bg-gray-950/60 rounded-xl border border-gray-100 dark:border-gray-800/80">
            <img
              src="/showtime-logo.png"
              :alt="title"
              class="w-full h-auto max-h-16 object-contain dark:hidden"
            >
            <img
              src="/showtime-logo-dark.png"
              :alt="title"
              class="w-full h-auto max-h-16 object-contain hidden dark:block"
            >
          </div>
          <div class="mt-6 grid grid-cols-3 gap-3 text-center">
            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <Zap class="w-4 h-4 mx-auto text-red-600 mb-1" />
              <div class="text-xs font-bold text-gray-800 dark:text-gray-200">毫秒边缘</div>
              <div class="text-[10px] text-gray-400 mt-0.5">极速分发</div>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <BarChart3 class="w-4 h-4 mx-auto text-red-600 mb-1" />
              <div class="text-xs font-bold text-gray-800 dark:text-gray-200">精准画像</div>
              <div class="text-[10px] text-gray-400 mt-0.5">转化溯源</div>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <ShieldCheck class="w-4 h-4 mx-auto text-red-600 mb-1" />
              <div class="text-xs font-bold text-gray-800 dark:text-gray-200">多权隔离</div>
              <div class="text-[10px] text-gray-400 mt-0.5">安全管控</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
