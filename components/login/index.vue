<script setup>
import { ShieldCheck, Lock, Loader } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const token = ref('')
const loading = ref(false)
const turnstileToken = ref('')
const turnstileWidgetId = ref(null)

const config = useRuntimeConfig()
const siteKey = config.public.turnstileSiteKey || '1x00000000000000000000AA'

function initTurnstile() {
  if (typeof window !== 'undefined' && window.turnstile) {
    try {
      const container = document.getElementById('turnstile-container')
      if (container && !turnstileWidgetId.value) {
        turnstileWidgetId.value = window.turnstile.render('#turnstile-container', {
          sitekey: siteKey,
          theme: 'auto',
          callback: (t) => {
            turnstileToken.value = t
          },
          'expired-callback': () => {
            turnstileToken.value = ''
          },
        })
      }
    }
    catch (e) {
      console.warn('Turnstile init error:', e)
    }
  }
  else {
    setTimeout(initTurnstile, 300)
  }
}

onMounted(() => {
  initTurnstile()
})

async function handleLogin() {
  if (!token.value) {
    toast.error('请输入授权口令')
    return
  }

  loading.value = true
  try {
    localStorage.setItem('SinkSiteToken', token.value.trim())
    await useAPI('/api/verify', {
      method: 'POST',
      body: {
        turnstileToken: turnstileToken.value,
      },
    })
    toast.success('身份认证成功，正在进入工作台...')
    navigateTo('/dashboard')
  }
  catch (e) {
    console.error(e)
    toast.error('登录认证失败', {
      description: e.data?.statusText || e.message || '请检查授权口令是否正确',
    })
    // 刷新验证码
    if (typeof window !== 'undefined' && window.turnstile && turnstileWidgetId.value) {
      window.turnstile.reset(turnstileWidgetId.value)
      turnstileToken.value = ''
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-sm shadow-xl border-gray-200/80 dark:border-gray-800">
    <CardHeader class="space-y-3 pb-3">
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
        请输入您的专属 16 位增强授权口令进入控制台
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <form
        class="space-y-4"
        @submit.prevent="handleLogin"
      >
        <div>
          <label class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
            授权口令 / 成员密码
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              v-model="token"
              type="password"
              placeholder="请输入 16 位强密码或授权口令"
              autocomplete="current-password"
              class="w-full pl-9 pr-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
            >
          </div>
        </div>

        <!-- Cloudflare Turnstile 人机验证码容器 -->
        <div class="flex flex-col items-center justify-center min-h-[66px] py-1">
          <div id="turnstile-container" />
        </div>

        <div class="flex items-center gap-2 p-2.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800">
          <ShieldCheck class="w-4 h-4 text-green-600 shrink-0" />
          <span>已接入 Cloudflare Turnstile 防暴力破解验证</span>
        </div>

        <Button
          type="submit"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5"
          :disabled="loading"
        >
          <Loader
            v-if="loading"
            class="w-4 h-4 mr-2 animate-spin"
          />
          进入管理工作台
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
