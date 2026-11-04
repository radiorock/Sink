export default eventHandler((event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')
  const rawConfig = useRuntimeConfig(event).siteToken || ''
  const validTokens = rawConfig
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean)

  if (
    event.path.startsWith('/api/') &&
    !event.path.startsWith('/api/_') &&
    !validTokens.includes(token || '')
  ) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
    })
  }
  if (token && token.length < 8) {
    throw createError({
      status: 401,
      statusText: 'Token is too short',
    })
  }
})
