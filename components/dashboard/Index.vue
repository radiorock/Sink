<script setup>
import { now } from '@internationalized/date'
import { Download, Loader } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps({
  link: {
    type: Object,
    default: () => null,
  },
})

const startAt = ref(date2unix(now().subtract({ days: 7 })))
const endAt = ref(date2unix(now()))

provide('startAt', startAt)
provide('endAt', endAt)
provide('slug', computed(() => props.link?.slug || ''))

function changeDate(time) {
  startAt.value = time[0]
  endAt.value = time[1]
}

const exporting = ref(false)
async function exportCSV() {
  exporting.value = true
  try {
    const [viewsData, referersData, regionsData] = await Promise.all([
      useAPI('/api/stats/views', {
        query: {
          id: props.link?.id,
          slug: props.link?.slug,
          unit: 'day',
          clientTimezone: getTimeZone(),
          startAt: startAt.value,
          endAt: endAt.value,
        },
      }),
      useAPI('/api/stats/metrics', {
        query: {
          type: 'referer',
          id: props.link?.id,
          slug: props.link?.slug,
          startAt: startAt.value,
          endAt: endAt.value,
        },
      }),
      useAPI('/api/stats/metrics', {
        query: {
          type: 'region',
          id: props.link?.id,
          slug: props.link?.slug,
          startAt: startAt.value,
          endAt: endAt.value,
        },
      }),
    ])

    let csv = '\uFEFF' // UTF-8 BOM 防 Excel 中文乱码
    csv += `ShowTime 展泰文化流量中枢统计报表\n`
    csv += `统计维度,${props.link ? props.link.slug : '全站综合大盘'}\n`
    csv += `统计区间,${shortDate(startAt.value)} 至 ${shortDate(endAt.value)}\n`
    csv += `导出时间,${new Date().toLocaleString()}\n\n`

    csv += `【按日访问趋势】\n日期,独立访客 (UV),总访问量 (PV)\n`
    const viewsList = Array.isArray(viewsData) ? viewsData : []
    for (const v of viewsList) {
      csv += `"${v.time}",${v.visitors},${v.visits}\n`
    }

    csv += `\n【引流渠道排名】\n引流来源,访问次数\n`
    const refList = Array.isArray(referersData?.data) ? referersData.data : []
    for (const r of refList) {
      csv += `"${r.name || '直接访问 / 无来源'}",${r.count}\n`
    }

    csv += `\n【访客省份与地域画像】\n省份/地域,访问次数\n`
    const regList = Array.isArray(regionsData?.data) ? regionsData.data : []
    for (const reg of regList) {
      csv += `"${reg.name || '其他/海外'}",${reg.count}\n`
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ShowTime-Traffic-${props.link?.slug || 'All'}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('报表已成功导出为 Excel/CSV 格式！')
  }
  catch (e) {
    toast.error('导出报表失败', { description: e.message })
  }
  finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 指标操作与时间筛选工具栏 -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
      <div>
        <h3 v-if="link" class="text-base font-semibold text-foreground">
          {{ link.slug }} 访问指标趋势
        </h3>
        <p v-else class="text-xs text-muted-foreground">
          全站各渠道与分发通道的访问时序监控
        </p>
      </div>
      <div class="flex items-center space-x-2 self-end sm:self-auto">
        <Button
          variant="outline"
          class="h-9 px-3 text-xs font-medium cursor-pointer"
          :disabled="exporting"
          title="导出当前时间段内的完整统计报表"
          @click="exportCSV"
        >
          <Loader
            v-if="exporting"
            class="w-3.5 h-3.5 mr-1.5 animate-spin"
          />
          <Download
            v-else
            class="w-3.5 h-3.5 mr-1.5 text-gray-500"
          />
          导出报表 (CSV)
        </Button>
        <DashboardDatePicker @update:date-range="changeDate" />
      </div>
    </div>

    <DashboardCounters />
    <DashboardViews />
    <DashboardMetrics />
    <DashboardSubdomainsOverview v-if="!link" />
  </div>
</template>
