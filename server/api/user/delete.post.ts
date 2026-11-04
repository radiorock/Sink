import { z } from 'zod'

const DeleteUserSchema = z.object({
  username: z.string().trim(),
})

export default eventHandler(async (event) => {
  const operator = await getOperatorContext(event)
  if (operator.role !== 'admin') {
    throw createError({
      status: 403,
      statusText: '仅管理员具备删除成员权限',
    })
  }

  const body = await readValidatedBody(event, DeleteUserSchema.parse)
  if (body.username === 'admin' || body.username === 'root') {
    throw createError({
      status: 400,
      statusText: '初始总控管理员账号禁止删除',
    })
  }

  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV) throw createError({ status: 500, statusText: 'KV unavailable' })

  const existing: HubUser | null = await KV.get(`user:${body.username}`, { type: 'json' })
  if (!existing) {
    throw createError({
      status: 404,
      statusText: '指定成员不存在',
    })
  }

  await KV.delete(`user:${body.username}`)

  let userList: string[] = await KV.get('users:list', { type: 'json' }) || []
  userList = userList.filter(u => u !== body.username)
  await KV.put('users:list', JSON.stringify(userList))

  await recordAuditLog(event, {
    action: 'DELETE_USER',
    actionLabel: '删除成员',
    target: body.username,
    details: `彻底删除成员 [${existing.name} (${body.username})]，其权限与口令已注销`,
  })

  return { success: true }
})
