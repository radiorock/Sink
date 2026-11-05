import { z } from 'zod'

const CreateSubdomainSchema = z.object({
  subdomain: z.string().trim().toLowerCase().min(2).max(63).regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, '二级域名前缀仅支持小写字母、数字及中划线'),
  url: z.string().trim().url('请输入合法的跳转目标链接 (包含 http:// 或 https://)'),
  title: z.string().trim().min(1).max(64),
  comment: z.string().trim().max(256).optional(),
})

const RESERVED_SUBDOMAINS = ['go', 'admin', 'api', 'www', 'mail', 'smtp', 'pop', 'imap', 'ftp', 'dns', 'ns1', 'ns2']

export default eventHandler(async (event) => {
  const operator = await getOperatorContext(event)
  if (operator.role === 'viewer') {
    throw createError({
      status: 403,
      statusText: '只读观察员账号无权新增二级域名',
    })
  }

  const body = await readValidatedBody(event, CreateSubdomainSchema.parse)
  if (RESERVED_SUBDOMAINS.includes(body.subdomain)) {
    throw createError({
      status: 400,
      statusText: `二级域名前缀 [${body.subdomain}] 为系统系统保留字，不可使用`,
    })
  }

  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV)
    throw createError({ status: 500, statusText: 'KV unavailable' })

  const existing = await KV.get(`subdomain:${body.subdomain}`, { type: 'json' })
  if (existing) {
    throw createError({
      status: 409,
      statusText: `二级域名 ${body.subdomain}.showtime.ing 已存在`,
    })
  }

  const channel: SubdomainChannel = {
    subdomain: body.subdomain,
    fullDomain: `${body.subdomain}.showtime.ing`,
    url: body.url,
    title: body.title,
    comment: body.comment || '',
    status: 'active',
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
    createdBy: operator.username,
  }

  await KV.put(`subdomain:${body.subdomain}`, JSON.stringify(channel))

  const subList: string[] = await KV.get('subdomains:list', { type: 'json' }) || []
  if (!subList.includes(body.subdomain)) {
    subList.push(body.subdomain)
    await KV.put('subdomains:list', JSON.stringify(subList))
  }

  await recordAuditLog(event, {
    action: 'CREATE_SUBDOMAIN',
    actionLabel: '新增二级域名',
    target: channel.fullDomain,
    details: `创建二级域名通道 [${channel.fullDomain}] -> [${channel.url}]，备注: [${channel.title}]`,
  })

  return { subdomain: channel }
})
