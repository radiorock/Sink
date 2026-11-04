export default eventHandler(async (event) => {
  if (!event.path.startsWith('/api/') || event.path.startsWith('/api/_')) {
    return
  }

  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')
  const rawConfig = useRuntimeConfig(event).siteToken || ''
  const validTokens = rawConfig
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean)

  let isAuthenticated = validTokens.includes(token || '')

  // 若不在环境变量预设列表中，检查 KV 用户体系
  if (!isAuthenticated && token) {
    const { cloudflare } = event.context
    const KV = cloudflare?.env?.KV
    if (KV) {
      const userList: string[] = await KV.get('users:list', { type: 'json' }) || []
      for (const username of userList) {
        const u = await KV.get(`user:${username}`, { type: 'json' })
        if (u && u.status === 'active' && (u.password === token || u.username === token)) {
          isAuthenticated = true
          break
        }
      }
    }
  }

  if (!isAuthenticated) {
    throw createError({
      status: 401,
      statusText: '未授权访问，口令无效或已过期',
    })
  }

  // 只读账号越权写拦截
  const method = getMethod(event)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const operator = await getOperatorContext(event)
    if (operator.role === 'viewer') {
      throw createError({
        status: 403,
        statusText: '当前为只读观察员账号，禁止执行新增、编辑或删除操作',
      })
    }
  }
})
