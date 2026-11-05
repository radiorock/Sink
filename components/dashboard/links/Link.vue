<script setup>
import { CalendarPlus2, Copy, CopyCheck, Eraser, Hourglass, Link as LinkIcon, MousePointerClick, QrCode, ShieldCheck, SquareChevronDown, SquarePen, Users } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { parseURL } from 'ufo'
import QRCode from './QRCode.vue'

const props = defineProps({
  link: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['update:link'])

const editPopoverOpen = ref(false)

const { host, origin } = location

function getLinkHost(url) {
  const { host } = parseURL(url)
  return host
}

const shortLink = computed(() => `${origin}/${props.link.slug}`)
const linkIcon = computed(() => `https://unavatar.io/${getLinkHost(props.link.url)}?fallback=/icon-192.png`)

const { copy, copied } = useClipboard({ source: shortLink.value, copiedDuring: 400 })

function updateLink(link, type) {
  emit('update:link', link, type)
  editPopoverOpen.value = false
}

const isExpired = computed(() => {
  if (!props.link.expiration)
    return false
  return Math.floor(Date.now() / 1000) > props.link.expiration
})
</script>

<template>
  <Card class="hover:shadow-md transition-shadow relative overflow-hidden" :class="{ 'border-amber-500/40 bg-amber-50/10': isExpired }">
    <div
      class="flex flex-col p-4 space-y-3 cursor-pointer"
      @click="navigateTo(`/dashboard/link?slug=${link.slug}`)"
    >
      <div class="flex items-center justify-center space-x-3">
        <Avatar class="border border-gray-100 dark:border-gray-800">
          <AvatarImage
            :src="linkIcon"
            alt="@radix-vue"
          />
          <AvatarFallback>
            <img
              src="/icon-192.png"
              alt="ShowTime"
            >
          </AvatarFallback>
        </Avatar>

        <div class="flex-1 overflow-hidden">
          <div class="flex items-center gap-1.5">
            <div class="font-bold leading-5 truncate text-sm sm:text-base font-mono text-gray-900 dark:text-gray-100">
              {{ host }}/{{ link.slug }}
            </div>

            <!-- 到期徽章 -->
            <span
              v-if="isExpired"
              class="px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 rounded shrink-0"
            >
              已截止
            </span>

            <!-- 微信防封标识 -->
            <span
              v-if="link.wechatShield"
              class="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded shrink-0 flex items-center gap-0.5"
              title="已开启微信防封浏览器引导"
            >
              <ShieldCheck class="w-3 h-3" /> 微信防封
            </span>

            <CopyCheck
              v-if="copied"
              class="w-4 h-4 ml-1 text-green-600 shrink-0"
              @click.stop
            />
            <Copy
              v-else
              class="w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
              title="复制短链"
              @click.stop="copy(shortLink);toast.success('短链已复制到剪贴板！')"
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {{ link.comment || link.title || link.description || '未命名短链通道' }}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-[90svw] break-all">
                  {{ link.comment || link.title || link.description || link.url }}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <a
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-md"
          title="直接打开目标网页"
          @click.stop
        >
          <LinkIcon class="w-4 h-4" />
        </a>

        <Popover>
          <PopoverTrigger as-child>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-md"
              title="查看二维码"
              @click.stop
            >
              <QrCode class="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-3" @click.stop>
            <QRCode
              :data="shortLink"
              :image="linkIcon"
            />
          </PopoverContent>
        </Popover>

        <Popover v-model:open="editPopoverOpen">
          <PopoverTrigger as-child>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-md"
              @click.stop
            >
              <SquareChevronDown class="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            class="w-auto p-0"
            :hide-when-detached="false"
            @click.stop
          >
            <DashboardLinksEditor
              :link="link"
              @update:link="updateLink"
            >
              <div
                class="cursor-pointer flex select-none items-center rounded-sm px-3 py-2 text-xs outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <SquarePen class="w-4 h-4 mr-2" />
                编辑短链
              </div>
            </DashboardLinksEditor>

            <Separator />

            <DashboardLinksDelete
              :link="link"
              @update:link="updateLink"
            >
              <div
                class="cursor-pointer flex select-none items-center rounded-sm px-3 py-2 text-xs text-red-600 outline-none hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Eraser class="w-4 h-4 mr-2" />
                删除短链
              </div>
            </DashboardLinksDelete>
          </PopoverContent>
        </Popover>
      </div>

      <!-- 实时点击量指标与标签栏 (真实物理统计直接呈现) -->
      <div class="flex flex-wrap items-center gap-1.5 pt-1">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 font-mono shadow-xs"
          title="累计访问次数 (PV)"
        >
          <MousePointerClick class="w-3 h-3 text-blue-600" />
          <span>{{ link.visits || 0 }} 访问</span>
        </span>
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-mono"
          title="独立访客人数 (UV)"
        >
          <Users class="w-3 h-3 text-gray-500" />
          <span>{{ link.visitors || 0 }} 访客</span>
        </span>

        <span
          v-for="t in link.tags"
          :key="t"
          class="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-300 font-mono"
        >
          #{{ t }}
        </span>
      </div>

      <!-- 底部元信息 -->
      <div class="flex items-center w-full text-[11px] text-gray-400 dark:text-gray-500 gap-2 border-t border-gray-100 dark:border-gray-800/80 pt-2">
        <span class="inline-flex items-center shrink-0">
          <CalendarPlus2 class="w-3.5 h-3.5 mr-1" />
          {{ shortDate(link.createdAt) }}
        </span>

        <template v-if="link.expiration">
          <span>·</span>
          <span
            class="inline-flex items-center shrink-0"
            :class="isExpired ? 'text-red-500 font-medium' : 'text-gray-500'"
          >
            <Hourglass class="w-3.5 h-3.5 mr-1" />
            {{ isExpired ? '已于 ' : '截止: ' }}{{ shortDate(link.expiration) }}
          </span>
        </template>

        <span>·</span>
        <span class="truncate font-mono" :title="link.url">{{ link.url }}</span>
      </div>
    </div>
  </Card>
</template>
