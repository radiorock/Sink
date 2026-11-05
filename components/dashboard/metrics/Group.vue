<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
})

const tabNameMap = {
  country: '国家/地区',
  region: '省份/地区',
  city: '城市',
  referer: '引流来源',
  slug: '短链标识',
  language: '语言偏好',
  timezone: '时区分布',
  device: '设备机型',
  deviceType: '设备分类',
  os: '操作系统',
  browser: '浏览器',
  browserType: '浏览器内核',
}

function type2name(type) {
  return tabNameMap[type] || type
}

const isFingerprintGroup = computed(() => {
  return props.tabs.some(t => ['language', 'timezone', 'device', 'deviceType', 'os', 'browser', 'browserType'].includes(t))
})
</script>

<template>
  <Tabs
    :default-value="tabs[0]"
    class="flex flex-col"
  >
    <div class="flex items-center justify-between gap-2 mb-1">
      <TabsList class="w-fit">
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab"
          :value="tab"
        >
          {{ type2name(tab) }}
        </TabsTrigger>
      </TabsList>
      <span
        v-if="isFingerprintGroup"
        class="text-[11px] text-muted-foreground hidden sm:inline-block font-mono px-2 py-0.5 rounded bg-muted/60"
        title="客户端软硬件指纹基于新版边缘遥测引擎实时采集样本"
      >
        新引擎实时样本
      </span>
    </div>
    <TabsContent
      v-for="tab in tabs"
      :key="tab"
      :value="tab"
      class="flex-1"
    >
      <DashboardMetricsMetric
        :type="tab"
        :name="type2name(tab)"
        class="h-full"
      />
    </TabsContent>
  </Tabs>
</template>
