import { LinkSchema } from '@/schemas/link'

export default eventHandler(async (event) => {
  const link = await readValidatedBody(event, LinkSchema.parse)

  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  const existingLink = await KV.get(`link:${link.slug}`)
  if (existingLink) {
    throw createError({
      status: 409, // Conflict
      statusText: 'Link already exists',
    })
  }

  else {
    const expiration = getExpiration(event, link.expiration)

    await KV.put(`link:${link.slug}`, JSON.stringify(link), {
      expiration,
      metadata: {
        expiration,
      },
    })
    setResponseStatus(event, 201)

    await recordAuditLog(event, {
      action: 'CREATE_LINK',
      actionLabel: '新建短链',
      target: link.slug,
      details: `新建短链 [/${link.slug}] -> [${link.url}]${link.comment ? `，备注: ${link.comment}` : ''}`,
    })

    return { link }
  }
})
