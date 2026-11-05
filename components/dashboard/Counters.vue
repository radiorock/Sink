<script setup>
import { Flame, MousePointerClick, Users } from 'lucide-vue-next'

const defaultData = Object.freeze({
  visits: 0,
  visitors: 0,
  referers: 0,
})

const counters = ref(defaultData)

const id = inject('id')
const slug = inject('slug', ref(''))
const startAt = inject('startAt')
const endAt = inject('endAt')

async function getLinkCounters() {
  counters.value = defaultData
  const { data } = await useAPI('/api/stats/counters', {
    query: {
      id: id.value,
      slug: slug.value,
      startAt: startAt.value,
      endAt: endAt.value,
    },
  })
  counters.value = data?.[0] || defaultData
}

const stopWatchTime = watch([startAt, endAt, id, slug], getLinkCounters)

onMounted(async () => {
  getLinkCounters()
})

onBeforeUnmount(() => {
  stopWatchTime()
})
</script>

<template>
  <div class="grid gap-4 sm:gap-3 lg:gap-4 sm:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          总访问量 (PV)
        </CardTitle>
        <MousePointerClick class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold font-mono">
          {{ formatNumber(counters.visits || 0) }}
        </div>
        <p class="text-[11px] text-gray-400 mt-1">
          全网边缘请求实时累计
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          独立访客 (UV)
        </CardTitle>
        <Users class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold font-mono">
          {{ formatNumber(counters.visitors || 0) }}
        </div>
        <p class="text-[11px] text-gray-400 mt-1">
          基于去重 IP 与设备画像
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          引流渠道来源
        </CardTitle>
        <Flame class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold font-mono">
          {{ formatNumber(counters.referers || 0) }}
        </div>
        <p class="text-[11px] text-gray-400 mt-1">
          涵盖社媒、票务与微信等
        </p>
      </CardContent>
    </Card>
  </div>
</template>
