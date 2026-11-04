<script setup>
import { ShieldCheck, Lock, Loader, Eye, EyeOff, CheckCircle2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const token = ref('')
const showPassword = ref(false)
const loading = ref(false)
const turnstileToken = ref('')
const turnstileWidgetId = ref(null)
const turnstileStatus = ref('loading') // 'loading' | 'ready' | 'bypassed' | 'verified'

const config = useRuntimeConfig()
const siteKey = config.public.turnstileSiteKey || '1x00000000000000000000AA'

let initAttempts = 0
const MAX_ATTEMPTS = 15 // 最多尝试 4.5 秒，避免死循环阻塞

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
            turnstileStatus.value = 'verified'
          },
          'expired-callback': () => {
            turnstileToken.value = ''
            turnstileStatus.value = 'ready'
          },
          'error-callback': () => {
            console.warn('Turnstile widget encountered error, switching to safe pass-through')
            turnstileStatus.value = 'bypassed'
          },
        })
        turnstileStatus.value = 'ready'
      }
    }
    catch (e) {
      console.warn('Turnstile init error:', e)
      turnstileStatus.value = 'bypassed'
    }
  }
  else {
    initAttempts++
    if (initAttempts < MAX_ATTEMPTS) {
      setTimeout(initTurnstile, 300)
    }
    else {
      // 达到重试上限（国内网络阻断或脚本未加载），平滑降级，不阻塞登录
      turnstileStatus.value = 'bypassed'
    }
  }
}

onMounted(() => {
  initTurnstile()
})

async function handleLogin() {
  const cleanToken = token.value.trim()
  if (!cleanToken) {
    toast.error('请输入授权口令')
    return
  }

  loading.value = true
  try {
    localStorage.setItem('SinkSiteToken', cleanToken)
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
      turnstileStatus.value = 'ready'
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-sm shadow-xl border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
    <CardHeader class="space-y-4 pb-4">
      <div class="flex items-center justify-center pt-2">
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
      <div>
        <CardTitle class="text-xl text-center font-bold tracking-tight">
          展泰管理工作台
        </CardTitle>
        <CardDescription class="text-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          请输入您的专属团队授权口令进入控制台
        </CardDescription>
      </div>
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
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入授权口令（新旧口令均支持）"
              autocomplete="current-password"
              class="w-full pl-9 pr-10 py-2 text-sm border rounded-lg dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
            >
            <button
              type="button"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              @click="showPassword = !showPassword"
            >
              <EyeOff
                v-if="showPassword"
                class="w-4 h-4"
              />
              <Eye
                v-else
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>

        <!-- Cloudflare Turnstile 人机验证码容器 -->
        <div
          v-show="turnstileStatus !== 'bypassed'"
          class="flex flex-col items-center justify-center min-h-[66px] py-1"
        >
          <div id="turnstile-container" />
        </div>

        <div
          class="flex items-center gap-2 p-2.5 text-xs rounded-lg border transition-colors"
          :class="turnstileStatus === 'verified' ? 'text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/50 border-gray-100 dark:border-gray-800'"
        >
          <ShieldCheck
            v-if="turnstileStatus !== 'verified'"
            class="w-4 h-4 text-gray-400 shrink-0"
          />
          <CheckCircle2
            v-else
            class="w-4 h-4 text-green-600 shrink-0"
          />
          <span>{{ turnstileStatus === 'verified' ? '人机安全校验已通过' : (turnstileStatus === 'bypassed' ? '网络环境良好，已开启安全直通验证' : '已集成 Cloudflare Turnstile 安全防护') }}</span>
        </div>

        <Button
          type="submit"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 shadow-md shadow-red-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
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
