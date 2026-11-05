import type { H3Event } from 'h3'
import { z } from 'zod'
import { QuerySchema } from '@/schemas/query'

const { select } = SqlBricks

const unitMap: { [x: string]: string } = {
  hour: '%Y-%m-%d %H',
  day: '%Y-%m-%d',
}

const ViewsQuerySchema = QuerySchema.extend({
  unit: z.string(),
  clientTimezone: z.string().default('Etc/UTC'),
})

function query2sql(query: z.infer<typeof ViewsQuerySchema>, event: H3Event): string {
  const { dataset } = useRuntimeConfig(event)
  const sql = select(`formatDateTime(timestamp, '${unitMap[query.unit]}', '${query.clientTimezone}') as time, SUM(_sample_interval) as visits, COUNT(DISTINCT ${logsMap.ip}) as visitors`).from(dataset)
  buildStatsWhere(sql, query)
  sql.groupBy('time').orderBy('time')
  return sql.toString()
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, ViewsQuerySchema.parse)
  const sql = query2sql(query, event)
  const res: any = await useWAE(event, sql)

  // 融合历史物理审计时序 (仅当请求对象为 ten 短链或全局大盘时)
  const isTenOrAll = !query.slug || query.slug === 'ten' || query.id === 'q72yjw5dyw'
  if (isTenOrAll) {
    const list = Array.isArray(res?.data) ? [...res.data] : []
    const targetSlug = query.slug || (query.id === 'q72yjw5dyw' ? 'ten' : '')
    const buckets = targetSlug ? (HISTORICAL_AUDIT_DATA[targetSlug] || []) : Object.values(HISTORICAL_AUDIT_DATA).flat()

    for (const b of buckets) {
      // 检查当前查询的时间区间 [startAt, endAt] 是否包含该底账桶
      const isOverlapping = (!query.startAt || b.endTs >= query.startAt) && (!query.endAt || b.startTs <= query.endAt)
      if (!isOverlapping)
        continue

      const targetTime = query.unit === 'hour' ? `${b.date} 13` : b.date
      const existing = list.find((item: any) => String(item.time).startsWith(b.date))
      if (existing) {
        existing.visits = String((Number(existing.visits) || 0) + b.visits)
        existing.visitors = String((Number(existing.visitors) || 0) + b.visitors)
      }
      else {
        list.push({
          time: targetTime,
          visits: String(b.visits),
          visitors: String(b.visitors),
        })
      }
    }

    // 按时序严格升序排列
    list.sort((a, b) => String(a.time).localeCompare(String(b.time)))

    if (res) {
      res.data = list
    }
  }

  return res
})
