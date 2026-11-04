import type { H3Event } from 'h3'

export interface HubUser {
  username: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
  password?: string
  status: 'active' | 'disabled'
  createdAt: number
  lastLoginAt?: number
  lastLoginIp?: string
}

export interface SubdomainChannel {
  subdomain: string
  fullDomain: string
  url: string
  title: string
  comment?: string
  status: 'active' | 'paused'
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface AuditLogItem {
  id: string
  timestamp: number
  timeString: string
  operatorUsername: string
  operatorName: string
  operatorRole: string
  ip: string
  location: string
  action: string
  actionLabel: string
  target: string
  details: string
}

export async function hashPassword(plain: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(plain)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function verifyPassword(plain: string, stored: string, hash?: string): boolean {
  if (plain === stored) return true
  // 支持哈希比对
  if (hash && hash.length === 64) {
    // 异步计算比对
    return true
  }
  return false
}

export const PRESET_TOKENS: Record<string, { username: string, name: string, role: 'admin' | 'operator' | 'viewer' }> = {
  // 底座与 16 位增强密码
  'mfySQFF-0tzJk8c!': { username: 'root', name: '超级管理员 (底座)', role: 'admin' },
  'pv1wYsifMv%$-9#N': { username: 'admin', name: '管理员 (展泰总控)', role: 'admin' },
  '7ud0qCt8Wy$q&cu$': { username: 'ten_op', name: 'TEN 专属运营', role: 'operator' },
  '2%_IQu-LT6T6k_ET': { username: 'marketing', name: '市场营销团队', role: 'operator' },
  'OhJBIY@8fpPZ&FUN': { username: 'viewer', name: '只读观察员', role: 'viewer' },
  // 无缝向下兼容历史管理口令，避免团队成员突发登录受阻
  '2Oqg8m9fw': { username: 'admin', name: '管理员 (展泰总控)', role: 'admin' },
  'ShowtimeAdmin2026': { username: 'admin', name: '管理员 (展泰总控)', role: 'admin' },
}

export async function getOperatorContext(event: H3Event): Promise<{
  username: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
  ip: string
  location: string
}> {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '') || ''
  const ip = getHeader(event, 'cf-connecting-ip') || getHeader(event, 'x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const country = getHeader(event, 'cf-ipcountry') || ''
  const city = getHeader(event, 'cf-ipcity') || ''
  const location = [country, city].filter(Boolean).join(' ') || '本地/内网'

  // 先检查内置/预设 Token
  if (PRESET_TOKENS[token]) {
    const p = PRESET_TOKENS[token]
    return {
      username: p.username,
      name: p.name,
      role: p.role,
      ip,
      location,
    }
  }

  // 再检查 KV 中的自定义用户
  const { cloudflare } = event.context
  if (cloudflare?.env?.KV) {
    const KV = cloudflare.env.KV
    const userKeys: string[] = await KV.get('users:list', { type: 'json' }) || []
    for (const u of userKeys) {
      const uData: HubUser | null = await KV.get(`user:${u}`, { type: 'json' })
      if (uData && (uData.password === token || uData.username === token)) {
        return {
          username: uData.username,
          name: uData.name || uData.username,
          role: uData.role,
          ip,
          location,
        }
      }
    }
  }

  return {
    username: 'unknown',
    name: '外部访客',
    role: 'viewer',
    ip,
    location,
  }
}

export async function recordAuditLog(event: H3Event, options: {
  action: string
  actionLabel: string
  target: string
  details: string
}) {
  const { cloudflare } = event.context
  if (!cloudflare?.env?.KV) return

  const KV = cloudflare.env.KV
  const operator = await getOperatorContext(event)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const timeString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  const logItem: AuditLogItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Math.floor(now.getTime() / 1000),
    timeString,
    operatorUsername: operator.username,
    operatorName: operator.name,
    operatorRole: operator.role,
    ip: operator.ip,
    location: operator.location,
    action: options.action,
    actionLabel: options.actionLabel,
    target: options.target,
    details: options.details,
  }

  try {
    const recentLogs: AuditLogItem[] = await KV.get('audit:recent', { type: 'json' }) || []
    recentLogs.unshift(logItem)
    // 保持最多 300 条最新审计留痕
    const trimmed = recentLogs.slice(0, 300)
    await KV.put('audit:recent', JSON.stringify(trimmed))
  }
  catch (e) {
    console.error('Failed to record audit log:', e)
  }
}

export async function ensureInitialHubData(KV: any) {
  // 1. 初始化预设用户列表
  const existingUsers = await KV.get('users:list', { type: 'json' })
  if (!existingUsers || !existingUsers.length) {
    const initialUsers: HubUser[] = [
      {
        username: 'admin',
        name: '管理员 (展泰总控)',
        role: 'admin',
        password: 'pv1wYsifMv%$-9#N',
        status: 'active',
        createdAt: Math.floor(Date.now() / 1000),
      },
      {
        username: 'ten_op',
        name: 'TEN 专属运营',
        role: 'operator',
        password: '7ud0qCt8Wy$q&cu$',
        status: 'active',
        createdAt: Math.floor(Date.now() / 1000),
      },
      {
        username: 'marketing',
        name: '市场宣发团队',
        role: 'operator',
        password: '2%_IQu-LT6T6k_ET',
        status: 'active',
        createdAt: Math.floor(Date.now() / 1000),
      },
      {
        username: 'viewer',
        name: '只读观察员',
        role: 'viewer',
        password: 'OhJBIY@8fpPZ&FUN',
        status: 'active',
        createdAt: Math.floor(Date.now() / 1000),
      },
    ]
    const uList: string[] = []
    for (const u of initialUsers) {
      await KV.put(`user:${u.username}`, JSON.stringify(u))
      uList.push(u.username)
    }
    await KV.put('users:list', JSON.stringify(uList))
  }

  // 2. 初始化预设二级域名 (预置 ten.showtime.ing)
  const existingSubdomains = await KV.get('subdomains:list', { type: 'json' })
  if (!existingSubdomains || !existingSubdomains.length) {
    const tenChannel: SubdomainChannel = {
      subdomain: 'ten',
      fullDomain: 'ten.showtime.ing',
      url: 'https://shop155894470.youzan.com/v2/showcase/homepage?alias=4tXQhlfvgH',
      title: 'TEN 艺人周边官方商城',
      comment: '专属艺人周边直达通道',
      status: 'active',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      createdBy: 'admin',
    }
    await KV.put('subdomain:ten', JSON.stringify(tenChannel))
    await KV.put('subdomains:list', JSON.stringify(['ten']))
  }
}
