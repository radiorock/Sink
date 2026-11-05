export default eventHandler(async (event) => {
  const slug = getQuery(event).slug
  if (slug) {
    const { cloudflare } = event.context
    const { KV } = cloudflare.env
    const { dataset } = useRuntimeConfig(event)
    const { metadata, value: link } = await KV.getWithMetadata(`link:${slug}`, { type: 'json' })
    if (link) {
      let visits = 0
      let visitors = 0

      // 实时聚合 Analytics Engine 数据
      try {
        const id = link.id || ''
        const querySql = SqlBricks.select(`SUM(_sample_interval) as visits, COUNT(DISTINCT ${logsMap.ip}) as visitors`)
          .from(dataset)
          .where(SqlBricks.or(
            SqlBricks.equal('blob1', slug),
            SqlBricks.equal('index1', slug),
            SqlBricks.equal('index1', id),
          ))
        const statsRes: any = await useWAE(event, querySql.toString())
        if (Array.isArray(statsRes?.data) && statsRes.data[0]) {
          visits = Number(statsRes.data[0].visits) || 0
          visitors = Number(statsRes.data[0].visitors) || 0
        }
      }
      catch (e) {
        console.error('Failed to query stats for single link:', e)
      }

      const baseStats = getHistoricalBaseStats(slug)

      return {
        ...metadata,
        ...link,
        visits: visits + baseStats.visits,
        visitors: visitors + baseStats.visitors,
      }
    }
  }
  throw createError({
    status: 404,
    statusText: 'Not Found',
  })
})
