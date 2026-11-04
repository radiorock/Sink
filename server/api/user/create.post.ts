import { z } from 'zod'

const CreateUserSchema = z.object({
  username: z.string().trim().min(2).max(32).regex(/^[a-zA-Z0-9_-]+$/, '用户名仅支持英文字母、数字、下划线及减号'),
  name: z.string().trim().min(1).max(32),
  role: z.enum(['admin', 'operator', 'viewer']),
  password: z.string().trim().min(6, '密码至少6位'),
})

export default eventHandler(async (event) => {
  const operator = await getOperatorContext(event)
  if (operator.role !== 'admin') {
    throw createError({
      status: 403,
      statusText: '仅管理员具备添加成员权限',
    })
  }

  const body = await readValidatedBody(event, CreateUserSchema.parse)
  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV) throw createError({ status: 500, statusText: 'KV unavailable' })

  const existing = await KV.get(`user:${body.username}`, { type: 'json' })
  if (existing) {
    throw createError({
      status: 409,
      statusText: '该用户名已存在，请使用其他用户名',
    })
  }

  const newUser: HubUser = {
    username: body.username,
    name: body.name,
    role: body.role,
    password: body.password,
    status: 'active',
    createdAt: Math.floor(Date.now() / 1000),
  }

  await KV.put(`user:${body.username}`, JSON.stringify(newUser))

  const userList: string[] = await KV.get('users:list', { type: 'json' }) || []
  if (!userList.includes(body.username)) {
    userList.push(body.username)
    await KV.put('users:list', JSON.stringify(userList))
  }

  await recordAuditLog(event, {
    action: 'CREATE_USER',
    actionLabel: '添加成员',
    target: body.username,
    details: `添加成员 [${body.name} (${body.username})]，角色设定为 [${body.role}]`,
  })

  return { success: true }
})
