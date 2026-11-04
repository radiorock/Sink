<script setup>
import { ShieldCheck } from 'lucide-vue-next'
import { z } from 'zod'
import { toast } from 'vue-sonner'

const LoginSchema = z.object({
  token: z.string().describe('授权口令 (Site Token)'),
})
const loginFieldConfig = {
  token: {
    inputProps: {
      type: 'password',
      placeholder: '请输入公司分配的授权口令',
    },
  },
}

async function onSubmit(form) {
  try {
    localStorage.setItem('SinkSiteToken', form.token)
    await useAPI('/api/verify')
    navigateTo('/dashboard')
  }
  catch (e) {
    console.error(e)
    toast.error('登录认证失败，请检查授权口令是否正确', {
      description: e.message,
    })
  }
}
</script>

<template>
  <Card class="w-full max-w-sm shadow-xl border-gray-200/80 dark:border-gray-800">
    <CardHeader class="space-y-3 pb-4">
      <div class="flex items-center justify-center pt-2 pb-1">
        <img
          src="/showtime-logo.png"
          alt="ShowTime 展泰文化"
          class="h-9 w-auto object-contain dark:hidden"
        >
        <img
          src="/showtime-logo-dark.png"
          alt="ShowTime 展泰文化"
          class="h-9 w-auto object-contain hidden dark:block"
        >
      </div>
      <CardTitle class="text-xl text-center font-bold">
        展泰团队管理工作台
      </CardTitle>
      <CardDescription class="text-center text-xs">
        请输入您的专属授权口令进入流量与短链控制台
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <AutoForm
        class="space-y-5"
        :schema="LoginSchema"
        :field-config="loginFieldConfig"
        @submit="onSubmit"
      >
        <div class="flex items-center gap-2 p-2.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
          <ShieldCheck class="w-4 h-4 text-green-600 shrink-0" />
          <span>支持管理员、运营及宣发团队专属授权口令登录</span>
        </div>
        <Button class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5">
          进入工作台
        </Button>
      </AutoForm>
    </CardContent>
  </Card>
</template>
