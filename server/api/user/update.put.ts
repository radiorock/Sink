import { z } from 'zod'

const UpdateUserSchema = z.object({
  username: z.string().trim(),
  name: z.string().trim().optional(),
  role: z.enum(['admin', 'operator', 'viewer']).optional(),
  password: z.string().trim().min(6).optional(),
  status: z.enum(['active', 'disabled']).optional(),
})

export default eventHandler(async (event) => {
  const operator = await getOperatorContext(event)
  if (operator.role !== 'admin') {
    throw createError({
      status: 403,
      statusText: '仅管理员具备修改成员信息权限',
    })
  }

  const body = await readValidatedBody(event, UpdateUserSchema.parse)
  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV) throw createError({ status: 500, statusText: 'KV unavailable' })

  const existing: HubUser | null = await KV.get(`user:${body.username}`, { type: 'json' })
  if (!existing) {
    throw createError({
      status: 404,
      statusText: '用户不存在',
    })
  }

  // 保护初始 admin 账号不可被禁用或降级
  if (body.username === 'admin' && (body.status === 'disabled' || (body.role && body.role !== 'admin'))) {
    throw createError({
      status: 400,
      statusText: '系统超级总控账号 admin 不可被降级或禁用',
    })
  }

  const changes: string[] = []
  if (body.name && body.name !== existing.name) {
    changes.push(`姓名: ${existing.name} -> ${body.name}`)
    existing.name = body.name
  }
  if (body.role && body.role !== existing.role) {
    changes.push(`角色: ${existing.role} -> ${body.role}`)
    existing.role = body.role
  }
  if (body.status && body.status !== existing.status) {
    changes.push(`状态: ${existing.status} -> ${body.status}`)
    existing.status = body.status
  }
  if (body.password) {
    changes.push('重置了登录密码')
    existing.password = body.password
  }

  await KV.put(`user:${body.username}`, JSON.stringify(existing))

  await recordAuditLog(event, {
    action: 'UPDATE_USER',
    actionLabel: '更新成员',
    target: body.username,
    details: `修改成员 [${existing.name} (${body.username})]: ${changes.join('; ') || '无字段变更'}`,
  })

  return { success: true }
})
