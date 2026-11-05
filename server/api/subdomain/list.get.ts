export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV)
    return { subdomains: [] }

  await ensureInitialHubData(KV)

  const { dataset } = useRuntimeConfig(event)
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
    console.error('Failed to pre-aggregate subdomain stats:', e)
  }

  const names: string[] = await KV.get('subdomains:list', { type: 'json' }) || []
  const subdomains: any[] = []

  for (const name of names) {
    const s: any = await KV.get(`subdomain:${name}`, { type: 'json' })
    if (s) {
      const stat = statsMap[name] || { visits: 0, visitors: 0 }
      const link: any = await KV.get(`link:${name}`, { type: 'json' })
      const baseVisits = Number(link?.baseVisits) || 0
      const baseVisitors = Number(link?.baseVisitors) || 0
      subdomains.push({
        ...s,
        visits: stat.visits + baseVisits,
        visitors: stat.visitors + baseVisitors,
      })
    }
  }

  return { subdomains }
})
