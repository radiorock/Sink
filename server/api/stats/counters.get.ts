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
  const res: any = await useWAE(event, sql)

  // 检查是否有历史底账基数需要对齐
  let baseVisits = 0
  let baseVisitors = 0
  try {
    const slug = query.slug || ''
    if (slug) {
      const { cloudflare } = event.context
      const link: any = await cloudflare.env.KV.get(`link:${slug}`, { type: 'json' })
      if (link) {
        baseVisits = Number(link.baseVisits) || 0
        baseVisitors = Number(link.baseVisitors) || 0
      }
    }
  }
  catch (e) {
    console.error('Failed to read base stats from KV:', e)
  }

  if (res && Array.isArray(res.data) && res.data[0]) {
    const currentVisits = Number(res.data[0].visits) || 0
    const currentVisitors = Number(res.data[0].visitors) || 0
    res.data[0].visits = String(currentVisits + baseVisits)
    res.data[0].visitors = String(currentVisitors + baseVisitors)
  }

  return res
})
