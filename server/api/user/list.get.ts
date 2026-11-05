export default eventHandler(async (event) => {
  const operator = await getOperatorContext(event)
  if (operator.role !== 'admin') {
    throw createError({
      status: 403,
      statusText: '仅管理员可查看与管理后台用户',
    })
  }

  const { cloudflare } = event.context
  const KV = cloudflare?.env?.KV
  if (!KV)
    return { users: [] }

  await ensureInitialHubData(KV)

  const usernames: string[] = await KV.get('users:list', { type: 'json' }) || []
  const users: any[] = []

  for (const username of usernames) {
    const u = await KV.get(`user:${username}`, { type: 'json' })
    if (u) {
      users.push({
        username: u.username,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        lastLoginIp: u.lastLoginIp,
      })
    }
  }

  return { users }
})
