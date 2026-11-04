import { z } from 'zod'

const UpdateSubdomainSchema = z.object({
  subdomain: z.string().trim().toLowerCase(),
  url: z.string().trim().url().optional(),
  title: z.string().trim().min(1).max(64).optional(),
  comment: z.string().trim().max(256).optional(),
  status: z.enum(['active', 'paused']).optional(),
})

export default eventHandler(async (event) => {
  const operator = await getOperatorContext(event)
  if (operator.role === 'viewer') {
    throw createError({
      status: 403,
      statusText: '只读观察员账号无权修改二级域名',
    })
  }

  const body = await readValidatedBody(event, UpdateSubdomainSchema.parse)
  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV) throw createError({ status: 500, statusText: 'KV unavailable' })

  const existing: SubdomainChannel | null = await KV.get(`subdomain:${body.subdomain}`, { type: 'json' })
  if (!existing) {
    throw createError({
      status: 404,
      statusText: '指定二级域名不存在',
    })
  }

  const diffs: string[] = []
  if (body.url && body.url !== existing.url) {
    diffs.push(`目标网址从 [${existing.url}] 修改为 [${body.url}]`)
    existing.url = body.url
  }
  if (body.title && body.title !== existing.title) {
    diffs.push(`标题从 [${existing.title}] 修改为 [${body.title}]`)
    existing.title = body.title
  }
  if (body.comment !== undefined && body.comment !== existing.comment) {
    diffs.push(`备注修改为 [${body.comment}]`)
    existing.comment = body.comment
  }
  if (body.status && body.status !== existing.status) {
    diffs.push(`通道状态从 [${existing.status}] 切换为 [${body.status}]`)
    existing.status = body.status
  }

  existing.updatedAt = Math.floor(Date.now() / 1000)

  await KV.put(`subdomain:${body.subdomain}`, JSON.stringify(existing))

  await recordAuditLog(event, {
    action: 'UPDATE_SUBDOMAIN',
    actionLabel: '更新二级域名',
    target: existing.fullDomain,
    details: `更新二级域名通道 [${existing.fullDomain}]: ${diffs.join('; ') || '无字段变更'}`,
  })

  return { subdomain: existing }
})
