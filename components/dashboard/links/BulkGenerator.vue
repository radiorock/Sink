<script setup>
import { Check, Globe, Layers, Loader, Share2, Sparkles } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { nanoid } from '@/schemas/link'

const emit = defineEmits(['refresh'])

const dialogOpen = ref(false)
const generating = ref(false)

const baseUrl = ref('')
const projectTag = ref('')
const comment = ref('')
const wechatShield = ref(false)

// 预设的海内外全渠道矩阵
const CHANNELS = [
  // 海外主流
  { id: 'instagram', name: 'Instagram', category: 'global', utm_source: 'instagram', utm_medium: 'social_bio' },
  { id: 'twitter', name: 'X (Twitter)', category: 'global', utm_source: 'twitter', utm_medium: 'tweet' },
  { id: 'tiktok', name: 'TikTok', category: 'global', utm_source: 'tiktok', utm_medium: 'short_video' },
  { id: 'facebook', name: 'Facebook', category: 'global', utm_source: 'facebook', utm_medium: 'event_page' },
  { id: 'spotify', name: 'Spotify', category: 'global', utm_source: 'spotify', utm_medium: 'artist_profile' },
  { id: 'ticketmaster', name: 'Ticketmaster', category: 'global', utm_source: 'ticketmaster', utm_medium: 'ticketing' },
  { id: 'weverse', name: 'Weverse', category: 'global', utm_source: 'weverse', utm_medium: 'community' },
  // 国内主流
  { id: 'wechat_moments', name: '微信朋友圈', category: 'domestic', utm_source: 'wechat_moments', utm_medium: 'feed' },
  { id: 'wechat_mp', name: '微信公众号', category: 'domestic', utm_source: 'wechat_mp', utm_medium: 'article' },
  { id: 'weibo', name: '微博官宣', category: 'domestic', utm_source: 'weibo', utm_medium: 'post' },
  { id: 'xiaohongshu', name: '小红书', category: 'domestic', utm_source: 'xiaohongshu', utm_medium: 'note' },
  { id: 'douyin', name: '抖音', category: 'domestic', utm_source: 'douyin', utm_medium: 'short_video' },
  { id: 'damai', name: '大麦分销', category: 'domestic', utm_source: 'damai', utm_medium: 'ticketing' },
  { id: 'offline_qr', name: '现场物料扫码', category: 'domestic', utm_source: 'offline_poster', utm_medium: 'qr_print' },
]

const selectedChannels = ref(new Set(['wechat_moments', 'weibo', 'xiaohongshu', 'instagram', 'tiktok']))

function toggleChannel(id) {
  if (selectedChannels.value.has(id)) {
    selectedChannels.value.delete(id)
  }
  else {
    selectedChannels.value.add(id)
  }
}

function selectAllGlobal() {
  CHANNELS.filter(c => c.category === 'global').forEach(c => selectedChannels.value.add(c.id))
}

function selectAllDomestic() {
  CHANNELS.filter(c => c.category === 'domestic').forEach(c => selectedChannels.value.add(c.id))
}

function clearAll() {
  selectedChannels.value.clear()
}

async function handleBatchGenerate() {
  const url = baseUrl.value.trim()
  if (!url) {
    toast.error('请输入基础落地链接 (URL)')
    return
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    toast.error('链接必须以 http:// 或 https:// 开头')
    return
  }
  if (selectedChannels.value.size === 0) {
    toast.error('请至少勾选一个投放渠道')
    return
  }

  generating.value = true
  const channelsToCreate = CHANNELS.filter(c => selectedChannels.value.has(c.id))
  let successCount = 0
  let failCount = 0

  for (const ch of channelsToCreate) {
    // 自动追加渠道 UTM
    const sep = url.includes('?') ? '&' : '?'
    const channelUrl = `${url.replace(/([?&])utm_source=[^&]*/g, '').replace(/([?&])utm_medium=[^&]*/g, '')}${sep}utm_source=${ch.utm_source}&utm_medium=${ch.utm_medium}`

    // 标签组合
    const tags = [ch.name]
    if (projectTag.value.trim()) {
      tags.unshift(projectTag.value.trim())
    }

    const payload = {
      url: channelUrl,
      slug: nanoid()(),
      comment: `[${ch.name}] ${comment.value.trim() || projectTag.value.trim() || '批量宣发分发'}`.trim(),
      wechatShield: wechatShield.value,
      tags,
    }

    try {
      await useAPI('/api/link/create', {
        method: 'POST',
        body: payload,
      })
      successCount++
    }
    catch (e) {
      console.error(`Failed to create link for channel ${ch.name}:`, e)
      failCount++
    }
  }

  generating.value = false
  dialogOpen.value = false
  emit('refresh')

  if (failCount === 0) {
    toast.success(`批量矩阵生成成功！已创建 ${successCount} 个渠道专属短链`)
  }
  else {
    toast.warning(`批量生成完成：成功 ${successCount} 条，失败 ${failCount} 条`)
  }
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogTrigger as-child>
      <Button
        variant="default"
        class="bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1.5"
      >
        <Layers class="w-4 h-4" />
        <span>批量矩阵生成</span>
      </Button>
    </DialogTrigger>

    <DialogContent class="max-w-[95svw] max-h-[92svh] md:max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-lg">
          <Sparkles class="w-5 h-5 text-red-600" />
          海内外多渠道宣发矩阵生成器
        </DialogTitle>
        <DialogDescription class="text-xs text-gray-500">
          只需输入一次落地页，系统将为选中的所有海内外渠道自动附加独立短码、标准化 UTM 参数与项目标签。
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <!-- 基础配置 -->
        <div class="space-y-3">
          <div>
            <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              基础目标落地页 (URL) *
            </label>
            <input
              v-model="baseUrl"
              type="url"
              placeholder="例如：https://shop155894470.youzan.com/v2/showcase/homepage?alias=4tXQhlfvgH"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
            >
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                项目 / 艺人分组标签 (可选)
              </label>
              <input
                v-model="projectTag"
                type="text"
                placeholder="例如：TEN巡演、草莓音乐节、早鸟票"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                投放备注 (可选)
              </label>
              <input
                v-model="comment"
                type="text"
                placeholder="例如：2026 Q4 第一波官宣物料"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              id="wechat-shield-toggle"
              v-model="wechatShield"
              type="checkbox"
              class="w-4 h-4 rounded text-red-600 focus:ring-red-600"
            >
            <label for="wechat-shield-toggle" class="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              为国内微信渠道短链默认开启「微信在浏览器打开」防封引导遮罩
            </label>
          </div>
        </div>

        <!-- 渠道选择矩阵 -->
        <div class="pt-2">
          <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-xs font-bold text-gray-800 dark:text-gray-200">
              勾选投放渠道 (已选 {{ selectedChannels.size }} 个)
            </span>
            <div class="flex items-center gap-2 text-xs">
              <button type="button" class="text-red-600 hover:underline" @click="selectAllGlobal">
                全选海外
              </button>
              <span class="text-gray-300">|</span>
              <button type="button" class="text-red-600 hover:underline" @click="selectAllDomestic">
                全选国内
              </button>
              <span class="text-gray-300">|</span>
              <button type="button" class="text-gray-400 hover:underline" @click="clearAll">
                清空
              </button>
            </div>
          </div>

          <!-- 海外平台 -->
          <div class="mt-3">
            <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe class="w-3.5 h-3.5" />
              国际平台 (海外票务、社媒、音乐与社区)
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <div
                v-for="ch in CHANNELS.filter(c => c.category === 'global')"
                :key="ch.id"
                class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none text-xs transition-all"
                :class="selectedChannels.has(ch.id) ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 font-medium' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850'"
                @click="toggleChannel(ch.id)"
              >
                <div
                  class="w-4 h-4 rounded flex items-center justify-center border shrink-0 text-[10px]"
                  :class="selectedChannels.has(ch.id) ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 dark:border-gray-600'"
                >
                  <Check v-if="selectedChannels.has(ch.id)" class="w-3 h-3" />
                </div>
                <span class="truncate">{{ ch.name }}</span>
              </div>
            </div>
          </div>

          <!-- 国内平台 -->
          <div class="mt-4">
            <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Share2 class="w-3.5 h-3.5" />
              国内主流 (微信、微博、小红书、抖音、大麦)
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <div
                v-for="ch in CHANNELS.filter(c => c.category === 'domestic')"
                :key="ch.id"
                class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none text-xs transition-all"
                :class="selectedChannels.has(ch.id) ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 font-medium' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850'"
                @click="toggleChannel(ch.id)"
              >
                <div
                  class="w-4 h-4 rounded flex items-center justify-center border shrink-0 text-[10px]"
                  :class="selectedChannels.has(ch.id) ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 dark:border-gray-600'"
                >
                  <Check v-if="selectedChannels.has(ch.id)" class="w-3 h-3" />
                </div>
                <span class="truncate">{{ ch.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between sm:justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary" :disabled="generating">
            取消
          </Button>
        </DialogClose>
        <Button
          class="bg-red-600 hover:bg-red-700 text-white font-medium"
          :disabled="generating || selectedChannels.size === 0"
          @click="handleBatchGenerate"
        >
          <Loader v-if="generating" class="w-4 h-4 mr-2 animate-spin" />
          <span>{{ generating ? `正在批量生成 (${selectedChannels.size}条)...` : `一键生成 ${selectedChannels.size} 条渠道短链` }}</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
