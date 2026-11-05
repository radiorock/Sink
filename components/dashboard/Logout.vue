<script setup>
import { LogOut } from 'lucide-vue-next'

function logOut() {
  localStorage.removeItem('SinkSiteToken')
  navigateTo('/dashboard/login')
}
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        title="退出当前登录"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent class="max-w-[95svw] max-h-[95svh] md:max-w-lg grid-rows-[auto_minmax(0,1fr)_auto]">
      <AlertDialogHeader>
        <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
        <AlertDialogDescription>
          确定要退出当前管理账号吗？退出后需重新输入授权口令。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="logOut">
          退出登录
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
