import type { H3Event } from 'h3'

export function useWAE(event: H3Event, query: string) {
  const { cfAccountId, cfApiToken } = useRuntimeConfig(event)
  return $fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/analytics_engine/sql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
    },
    body: query,
    retry: 1,
    retryDelay: 100, // ms
  }).catch((err) => {
    console.error('Cloudflare Analytics Engine query failed:', err?.message || err)
    // 捕获异常降级返回空结构，严禁抛出 401 导致前端误判用户登录态过期
    return {
      data: [],
      rows: 0,
      meta: [],
    }
  })
}
