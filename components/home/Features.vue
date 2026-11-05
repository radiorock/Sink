<script setup>
import {
  BarChart3,
  QrCode,
  Share2,
  Sparkles,
  Users2,
  Zap,
} from 'lucide-vue-next'

const features = ref([
  {
    title: '演出与项目专属通道',
    description: '支持为旗下巡演项目、品牌活动及演出定制专属独立二级域名与个性化短链。',
    icon: Sparkles,
  },
  {
    title: '全社交渠道精准溯源',
    description: '自动解析并统计来自微信聊天、朋友圈、微博、小红书、抖音等各渠道的访客流量。',
    icon: Share2,
  },
  {
    title: '边缘毫秒级极速直跳',
    description: '基于 Cloudflare 顶级全球边缘网络，确保海量观众在开票与物料宣发瞬间零延迟秒开。',
    icon: Zap,
  },
  {
    title: '现场物料专属二维码',
    description: '演出门票、易拉宝、周边包装与宣传海报可一键生成带渠道标记的高清二维码。',
    icon: QrCode,
  },
  {
    title: '公司团队多账号协同',
    description: '为管理层、各项目运营团队及市场宣发成员配置独立专属口令，权限分级管理。',
    icon: Users2,
  },
  {
    title: '粉丝地域与转化大盘',
    description: '实时呈现全国粉丝省份分布、iOS/安卓/微信客户端设备画像与访问趋势折线图。',
    icon: BarChart3,
  },
])
</script>

<template>
  <section class="py-16 border-t border-gray-100 dark:border-gray-800">
    <div class="max-w-2xl mx-auto mb-12 text-center">
      <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-gray-100">
        专为演出与艺人生态打造的核心能力
      </h2>
      <p class="mt-4 text-base text-gray-600 dark:text-gray-400">
        ShowTime 展泰文化演艺分发系统，连接每一场演出与每一位热爱艺术的观众
      </p>
    </div>

    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in features"
        :key="item.title"
        class="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl mb-4">
          <component
            :is="item.icon"
            class="w-5 h-5"
          />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          {{ item.title }}
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {{ item.description }}
        </p>
      </div>
    </div>
  </section>
</template>
