export default defineAppConfig({
  title: 'ShowTime 展泰文化',
  description: 'ShowTime 展泰文化演艺链接与流量分发中枢 - 演出·艺人·周边全渠道数据平台',
  image: '/showtime-logo.png',
  previewTTL: 24 * 3600, // 24h
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
