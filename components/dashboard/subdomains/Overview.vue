<script setup>
import { ArrowRight, CheckCircle2, Copy, ExternalLink, Globe, PauseCircle } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'

const subdomains = ref([])
const loading = ref(true)

async function fetchSubdomains() {
  loading.value = true
  try {
    const res = await useAPI('/api/subdomain/list')
    subdomains.value = res.subdomains || []
  }
  catch {
    // 静默
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSubdomains()
})

const { copy } = useClipboard()
function copyDomain(domain) {
  copy(`https://${domain}`)
  toast.success(`二级域名 https://${domain} 已复制到剪贴板！`)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <div class="p-2 bg-red-50 dark:bg-red-950/40 rounded-lg text-red-600">
          <Globe class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">
            专属二级域名通道大盘
          </h3>
          <p class="text-xs text-gray-500">
            全网边缘 Worker 动态映射状态与实时落地页监控
          </p>
        </div>
      </div>
      <NuxtLink
        to="/dashboard/subdomains"
        class="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
      >
        <span>管理通道</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-6 text-xs text-gray-400">
      正在同步二级域名通道数据...
    </div>

    <div v-else-if="subdomains.length === 0" class="text-center py-6 text-xs text-gray-400">
      暂未配置二级域名通道
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div
        v-for="sub in subdomains"
        :key="sub.subdomain"
        class="flex flex-col justify-between p-3.5 rounded-lg border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-950/40 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-1.5 font-bold text-sm text-gray-900 dark:text-gray-100 font-mono">
              <span>{{ sub.fullDomain }}</span>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="复制域名"
                @click="copyDomain(sub.fullDomain)"
              >
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              {{ sub.title }}
            </div>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 rounded font-mono">
                👁️ {{ sub.visits || 0 }} 访问
              </span>
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded font-mono">
                👥 {{ sub.visitors || 0 }} 访客
              </span>
            </div>
          </div>

          <span
            class="px-2 py-0.5 text-[10px] font-medium rounded-full flex items-center gap-1 shrink-0"
            :class="sub.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
          >
            <CheckCircle2 v-if="sub.status === 'active'" class="w-3 h-3 text-emerald-600" />
            <PauseCircle v-else class="w-3 h-3 text-gray-400" />
            <span>{{ sub.status === 'active' ? '正常分发' : '已暂停' }}</span>
          </span>
        </div>

        <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span class="truncate max-w-[240px] font-mono" :title="sub.url">
            ↳ {{ sub.url }}
          </span>
          <a
            :href="`https://${sub.fullDomain}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 ml-2"
            title="测试直达"
          >
            <ExternalLink class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
