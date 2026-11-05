<script setup>
import { AreaChart } from '@/components/ui/chart-area'
import { BarChart } from '@/components/ui/chart-bar'

const views = ref([])
const chart = computed(() => views.value.length > 1 ? AreaChart : BarChart)

const id = inject('id')
const slug = inject('slug', ref(''))
const startAt = inject('startAt')
const endAt = inject('endAt')

const OneDay = 24 * 60 * 60 // 1 day in seconds
function getUnit(startAt, endAt) {
  if (startAt && endAt && endAt - startAt <= OneDay)
    return 'hour'

  return 'day'
}

async function getLinkViews() {
  views.value = []
  const { data } = await useAPI('/api/stats/views', {
    query: {
      id: id.value,
      slug: slug.value,
      unit: getUnit(startAt.value, endAt.value),
      clientTimezone: getTimeZone(),
      startAt: startAt.value,
      endAt: endAt.value,
    },
  })
  views.value = (data || []).map((item) => {
    item.visitors = +item.visitors
    item.visits = +item.visits
    return item
  })
}

const stopWatchTime = watch([startAt, endAt, id, slug], getLinkViews)

onMounted(async () => {
  getLinkViews()
})

onBeforeUnmount(() => {
  stopWatchTime()
})

function formatTime(tick) {
  const idx = Math.round(Number(tick))
  const item = views.value[idx]
  if (item && item.time) {
    const t = String(item.time)
    if (getUnit(startAt.value, endAt.value) === 'hour' && t.includes(' ')) {
      return `${t.split(' ')[1]}:00`
    }
    return t.length >= 10 ? t.slice(5).replace('-', '/') : t
  }
  return ''
}
</script>

<template>
  <Card class="px-0 py-6 md:px-6">
    <CardTitle class="px-6 md:px-0">
      访问量趋势
    </CardTitle>
    <component
      :is="chart"
      :data="views"
      index="time"
      :categories="['visitors', 'visits']"
      :x-formatter="formatTime"
      :y-formatter="formatNumber"
    />
  </Card>
</template>
