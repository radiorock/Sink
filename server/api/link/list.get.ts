import { z } from 'zod'

export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  const { dataset } = useRuntimeConfig(event)
  const { limit, cursor } = await getValidatedQuery(event, z.object({
    limit: z.coerce.number().max(1024).default(24),
    cursor: z.string().trim().max(1024).optional(),
  }).parse)

  const list = await KV.list({
    prefix: `link:`,
    limit,
    cursor,
  })

  // 1. 批量拉取 Analytics Engine 聚合数据 (极速毫秒级响应)
  const statsMap: Record<string, { visits: number, visitors: number }> = {}
  try {
    const statsSql = `SELECT blob1 as slug, SUM(_sample_interval) as visits, COUNT(DISTINCT blob4) as visitors FROM ${dataset} GROUP BY blob1`
    const statsRes: any = await useWAE(event, statsSql)
    if (Array.isArray(statsRes?.data)) {
      for (const row of statsRes.data) {
        if (row.slug) {
          statsMap[row.slug] = {
            visits: Number(row.visits) || 0,
            visitors: Number(row.visitors) || 0,
          }
        }
      }
    }
  }
  catch (e) {
    console.error('Failed to pre-aggregate link stats:', e)
  }

  // 2. 组装短链元数据与统计数值
  if (Array.isArray(list.keys)) {
    list.links = await Promise.all(list.keys.map(async (key: { name: string }) => {
      const { metadata, value: link } = await KV.getWithMetadata(key.name, { type: 'json' })
      if (link) {
        const slug = link.slug
        const stat = statsMap[slug] || { visits: 0, visitors: 0 }
        const baseStats = getHistoricalBaseStats(slug)
        return {
          ...metadata,
          ...link,
          visits: stat.visits + baseStats.visits,
          visitors: stat.visitors + baseStats.visitors,
        }
      }
      return link
    }))
  }
  delete list.keys
  return list
})
