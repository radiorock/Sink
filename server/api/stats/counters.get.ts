import type { H3Event } from 'h3'
import { QuerySchema } from '@/schemas/query'

const { select } = SqlBricks

function query2sql(query: Query, event: H3Event): string {
  const { dataset } = useRuntimeConfig(event)
  const sql = select(`SUM(_sample_interval) as visits, COUNT(DISTINCT ${logsMap.ip}) as visitors, COUNT(DISTINCT ${logsMap.referer}) as referers`).from(dataset)
  buildStatsWhere(sql, query)
  return sql.toString()
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, QuerySchema.parse)
  const sql = query2sql(query, event)
  let res: any = await useWAE(event, sql)

  // 检查是否有历史底账基数需要对齐 (涵盖单个短链与全站大盘，按时间窗口精确匹配)
  let baseVisits = 0
  let baseVisitors = 0
  try {
    const targetSlug = query.slug || ''
    const baseStats = getHistoricalBaseStats(targetSlug, query.startAt, query.endAt)
    baseVisits = baseStats.visits
    baseVisitors = baseStats.visitors
  }
  catch (e) {
    console.error('Failed to compute base stats:', e)
  }

  // 保证结构健全
  if (!res || !Array.isArray(res.data) || res.data.length === 0) {
    res = {
      meta: [
        { name: 'visits', type: 'UInt64' },
        { name: 'visitors', type: 'UInt64' },
        { name: 'referers', type: 'UInt64' },
      ],
      data: [{ visits: '0', visitors: '0', referers: '0' }],
      rows: 1,
    }
  }

  const currentVisits = Number(res.data[0]?.visits) || 0
  const currentVisitors = Number(res.data[0]?.visitors) || 0
  res.data[0].visits = String(currentVisits + baseVisits)
  res.data[0].visitors = String(currentVisitors + baseVisitors)

  return res
})
