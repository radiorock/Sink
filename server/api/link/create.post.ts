import { LinkSchema } from '@/schemas/link'

export default eventHandler(async (event) => {
  const link = await readValidatedBody(event, LinkSchema.parse)

  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  const existingLink = await KV.get(`link:${link.slug}`)
  if (existingLink) {
    throw createError({
      status: 409, // Conflict
      statusText: '短链标识 (Slug) 已存在，请更换其他后缀',
    })
  }

  const { previewMode } = useRuntimeConfig(event).public
  const kvOptions: any = {
    metadata: {
      expiration: link.expiration,
      tags: link.tags || [],
    },
  }

  // 仅在预览体验模式下启用底层 KV 物理销毁；生产模式下持久化，由业务重定向层精准执行到期 Fallback 跳转
  if (previewMode) {
    const expiration = getExpiration(event, link.expiration)
    if (expiration) {
      kvOptions.expiration = expiration
    }
  }

  await KV.put(`link:${link.slug}`, JSON.stringify(link), kvOptions)
  setResponseStatus(event, 201)

  await recordAuditLog(event, {
    action: 'CREATE_LINK',
    actionLabel: '新建短链',
    target: link.slug,
    details: `新建短链 [/${link.slug}] -> [${link.url}]${link.comment ? `，备注: ${link.comment}` : ''}${link.tags?.length ? `，标签: ${link.tags.join(',')}` : ''}`,
  })

  return { link }
})
