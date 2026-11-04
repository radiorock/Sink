<script setup>
defineProps({
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
</script>

<template>
  <Tabs
    :default-value="tabs[0]"
    class="flex flex-col"
  >
    <TabsList class="w-fit">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab"
        :value="tab"
      >
        {{ type2name(tab) }}
      </TabsTrigger>
    </TabsList>
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
