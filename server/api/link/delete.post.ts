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

    await recordAuditLog(event, {
      action: 'DELETE_LINK',
      actionLabel: '删除短链',
      target: slug,
      details: `彻底删除短链 [/${slug}] (原目标: ${existing?.url || '未知'})`,
    })
  }
})
