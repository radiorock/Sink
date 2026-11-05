<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})

function normalizeLanguage(rawName) {
  if (!rawName)
    return '(直接访问/未知)'
  // 截取核心语言 tag，剥离带权重的后缀，例如 zh-CN,zh;q=0.9 -> zh-CN
  const clean = rawName.split(',')[0].split(';')[0].trim()
  const lower = clean.toLowerCase()

  const langMap = {
    'zh-cn': '简体中文',
    'zh': '简体中文',
    'zh-hans': '简体中文',
    'zh-tw': '繁体中文 (台湾)',
    'zh-hk': '繁体中文 (香港)',
    'zh-hant': '繁体中文',
    'ja': '日语',
    'ja-jp': '日语',
    'th': '泰语',
    'th-th': '泰语',
    'en': '英语',
    'en-us': '英语 (美国)',
    'en-gb': '英语 (英国)',
    'en-au': '英语 (澳大利亚)',
    'ko': '韩语',
    'ko-kr': '韩语',
    'vi': '越南语',
    'vi-vn': '越南语',
    'id': '印尼语',
    'id-id': '印尼语',
    'ms': '马来语',
    'fr': '法语',
    'de': '德语',
    'es': '西班牙语',
    'ru': '俄语',
    'it': '意大利语',
    'pt': '葡萄牙语',
    'ar': '阿拉伯语',
  }

  if (langMap[lower]) {
    return langMap[lower]
  }

  try {
    const languageNames = new Intl.DisplayNames(['zh-CN', 'zh'], { type: 'language' })
    const resolved = languageNames.of(clean)
    if (resolved && resolved !== clean) {
      return resolved
    }
  }
  catch {
    // 忽略异常
  }

  return clean
}

function normalizeCountry(rawName) {
  if (!rawName)
    return '(直接访问/未知)'
  try {
    const regionNames = new Intl.DisplayNames(['zh-CN', 'zh'], { type: 'region' })
    return regionNames.of(rawName) || rawName
  }
  catch {
    return rawName
  }
}

function normalizeTimezone(rawName) {
  if (!rawName)
    return '(直接访问/未知)'
  const tzMap = {
    'Asia/Bangkok': '泰国·曼谷时区 (UTC+7)',
    'Asia/Shanghai': '中国标准时间 (UTC+8)',
    'Asia/Hong_Kong': '中国·香港时区 (UTC+8)',
    'Asia/Singapore': '新加坡时区 (UTC+8)',
    'Asia/Tokyo': '日本标准时间 (UTC+9)',
    'America/Los_Angeles': '美国太平洋时间 (UTC-8)',
    'America/New_York': '美国东部时间 (UTC-5)',
    'Europe/London': '英国伦敦时区 (UTC+0)',
    'Europe/Paris': '欧洲中部时间 (UTC+1)',
    'Europe/Amsterdam': '欧洲·阿姆斯特丹 (UTC+1)',
  }
  return tzMap[rawName] || rawName
}

function formatName(name, type) {
  if (!name)
    return '(直接访问/未知)'

  if (type === 'country') {
    return normalizeCountry(name)
  }
  if (type === 'language') {
    return normalizeLanguage(name)
  }
  if (type === 'timezone') {
    return normalizeTimezone(name)
  }
  return name
}
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger class="w-full text-left">
        <DashboardMetricsNameReferer
          v-if="name && type === 'referer'"
          :name="name"
        />
        <DashboardMetricsNameSlug
          v-else-if="name && type === 'slug'"
          :name="name"
        />
        <DashboardMetricsNameIcon
          v-else-if="name && ['os', 'browser', 'browserType', 'device', 'deviceType'].includes(type)"
          :name="name"
          :type="type"
        />
        <div
          v-else
          class="w-full truncate"
        >
          {{ formatName(name, type) }}
        </div>
      </TooltipTrigger>
      <TooltipContent v-if="name">
        <p>
          {{ formatName(name, type) }}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
