<script setup>
const { title } = useAppConfig()
</script>

<template>
  <section class="mt-auto border-t border-gray-100 dark:border-gray-800">
    <div class="container flex flex-col items-center justify-between py-6 mx-auto sm:flex-row text-sm text-gray-500 dark:text-gray-400">
      <div class="flex items-center space-x-3">
        <span class="font-bold text-gray-800 dark:text-gray-200">{{ title }}</span>
        <span class="text-xs text-gray-400">|</span>
        <span class="text-xs text-gray-500">演出·艺人·周边全渠道流量分发中枢</span>
      </div>
      <div class="mt-4 sm:mt-0 text-xs">
        &copy; {{ new Date().getFullYear() }} ShowTime 展泰文化. All rights reserved.
      </div>
    </div>
  </section>
</template>
