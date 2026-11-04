export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV) return { logs: [] }

  const logs: AuditLogItem[] = await KV.get('audit:recent', { type: 'json' }) || []
  return { logs }
})
