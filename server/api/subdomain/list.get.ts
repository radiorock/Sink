export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV) return { subdomains: [] }

  await ensureInitialHubData(KV)

  const names: string[] = await KV.get('subdomains:list', { type: 'json' }) || []
  const subdomains: any[] = []

  for (const name of names) {
    const s = await KV.get(`subdomain:${name}`, { type: 'json' })
    if (s) {
      subdomains.push(s)
    }
  }

  return { subdomains }
})
