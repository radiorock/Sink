<script setup>
definePageMeta({
  layout: false,
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-slate-50/60 dark:bg-gray-950 px-4 py-8 relative">
    <div class="absolute top-4 right-4 z-10">
      <SwitchTheme />
    </div>

    <div class="flex-1 flex items-center justify-center">
      <Login />
    </div>

    <div class="text-center text-xs text-gray-400 dark:text-gray-600 py-2">
      © 2026 ShowTime 展泰文化 · 全链路流量中枢控制台
    </div>
  </div>
</template>
