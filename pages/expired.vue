<script setup>
definePageMeta({
  layout: false,
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between items-center bg-slate-50 dark:bg-gray-950 px-4 py-12 text-center">
    <div class="w-full max-w-md pt-8">
      <div class="flex justify-center mb-6">
        <img
          src="/showtime-logo.png"
          alt="ShowTime 展泰文化"
          class="h-10 w-auto object-contain dark:hidden"
        >
        <img
          src="/showtime-logo-dark.png"
          alt="ShowTime 展泰文化"
          class="h-10 w-auto object-contain hidden dark:block"
        >
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-8 shadow-xl">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 text-2xl font-bold">
          ⏳
        </div>

        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          该活动通道已截止或已下线
        </h1>

        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          非常抱歉，您访问的专属票务或宣发通道已达到预设截止时间。如需获取最新演出门票与艺人动态，请访问 ShowTime 展泰文化官方门户。
        </p>

        <a
          href="/"
          class="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20 transition-all"
        >
          返回展泰文化官方首页
        </a>
      </div>
    </div>

    <div class="text-xs text-gray-400 dark:text-gray-600 pt-6">
      © 2026 ShowTime 展泰文化 · 智能流量分发中枢
    </div>
  </div>
</template>
