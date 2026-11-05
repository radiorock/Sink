export default eventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'POST') {
    const body = await readBody(event).catch(() => ({}))
    const turnstileToken = body?.turnstileToken || getHeader(event, 'x-turnstile-token')
    const { turnstileSecretKey } = useRuntimeConfig(event)

    if (turnstileSecretKey && turnstileToken) {
      const ip = getHeader(event, 'cf-connecting-ip') || getHeader(event, 'x-forwarded-for')?.split(',')[0] || ''
      const formData = new FormData()
      formData.append('secret', turnstileSecretKey)
      formData.append('response', turnstileToken)
      if (ip) {
        formData.append('remoteip', ip)
      }

      try {
        const verifyRes: any = await $fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData,
        })
        if (!verifyRes.success) {
          throw createError({
            status: 403,
            statusText: 'Cloudflare 人机安全校验未通过，请刷新后重试',
          })
        }
      }
      catch (e: any) {
        if (e?.status === 403)
          throw e
        console.error('Turnstile verification error:', e)
      }
    }
  }

  return {
    name: 'ShowTime 展泰文化',
    url: 'https://go.showtime.ing',
    success: true,
  }
})
