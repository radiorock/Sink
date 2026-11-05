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
        const statsSql = `SELECT SUM(_sample_interval) as visits, COUNT(DISTINCT ${logsMap.ip}) as visitors FROM ${dataset} WHERE blob1 = '${slug}' OR index1 = '${slug}' OR index1 = '${id}'`
        const statsRes: any = await useWAE(event, statsSql)
        if (Array.isArray(statsRes?.data) && statsRes.data[0]) {
          visits = Number(statsRes.data[0].visits) || 0
          visitors = Number(statsRes.data[0].visitors) || 0
        }
      }
      catch (e) {
        console.error('Failed to query stats for single link:', e)
      }

      const baseVisits = Number(link.baseVisits) || 0
      const baseVisitors = Number(link.baseVisitors) || 0

      return {
        ...metadata,
        ...link,
        visits: visits + baseVisits,
        visitors: visitors + baseVisitors,
      }
    }
  }
  throw createError({
    status: 404,
    statusText: 'Not Found',
  })
})
