import { z } from 'zod'

const DeleteSubdomainSchema = z.object({
  subdomain: z.string().trim().toLowerCase(),
})

export default eventHandler(async (event) => {
  const operator = await getOperatorContext(event)
  if (operator.role === 'viewer') {
    throw createError({
      status: 403,
      statusText: '只读观察员账号无权删除二级域名',
    })
  }

  const body = await readValidatedBody(event, DeleteSubdomainSchema.parse)
  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV)
    throw createError({ status: 500, statusText: 'KV unavailable' })

  const existing: SubdomainChannel | null = await KV.get(`subdomain:${body.subdomain}`, { type: 'json' })
  if (!existing) {
    throw createError({
      status: 404,
      statusText: '指定二级域名不存在',
    })
  }

  await KV.delete(`subdomain:${body.subdomain}`)

  let subList: string[] = await KV.get('subdomains:list', { type: 'json' }) || []
  subList = subList.filter(s => s !== body.subdomain)
  await KV.put('subdomains:list', JSON.stringify(subList))

  await recordAuditLog(event, {
    action: 'DELETE_SUBDOMAIN',
    actionLabel: '删除二级域名',
    target: existing.fullDomain,
    details: `彻底注销并删除二级域名通道 [${existing.fullDomain}] (原指向: ${existing.url})`,
  })

  return { success: true }
})
