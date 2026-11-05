export default eventHandler(async (event) => {
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot delete links.',
    })
  }
  const { slug } = await readBody(event)
  if (slug) {
    const { cloudflare } = event.context
    const { KV } = cloudflare.env
    const existing: any = await KV.get(`link:${slug}`, { type: 'json' })
    await KV.delete(`link:${slug}`)

    // 联动检查并清理同名专属二级域名
    const existingSub = await KV.get(`subdomain:${slug}`, { type: 'json' })
    if (existingSub) {
      await KV.delete(`subdomain:${slug}`)
      let subList: string[] = await KV.get('subdomains:list', { type: 'json' }) || []
      subList = subList.filter((s: string) => s !== slug)
      await KV.put('subdomains:list', JSON.stringify(subList))
    }

    await recordAuditLog(event, {
      action: 'DELETE_LINK',
      actionLabel: '删除短链',
      target: slug,
      details: `彻底删除短链 [/${slug}] (原目标: ${existing?.url || '未知'})${existingSub ? '，并联动注销同名二级域名' : ''}`,
    })
  }
})
