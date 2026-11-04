import type { z } from 'zod'
import { parsePath, withQuery } from 'ufo'
import type { LinkSchema } from '@/schemas/link'

function renderWeChatShieldHtml(targetUrl: string, title?: string): string {
  const safeTitle = title || 'ShowTime 展泰文化'
  const safeUrl = targetUrl.replace(/"/g, '&quot;')
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${safeTitle} - 请在浏览器中打开</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
      padding: 24px;
    }
    .wechat-arrow {
      position: absolute;
      top: 12px;
      right: 24px;
      text-align: right;
      z-index: 10;
      animation: bounce 1.5s infinite;
    }
    .arrow-icon {
      font-size: 38px;
      color: #38bdf8;
      line-height: 1;
    }
    .arrow-text {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .card {
      margin-top: 80px;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 28px 20px;
      text-align: center;
      backdrop-filter: blur(12px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .logo {
      height: 42px;
      margin-bottom: 20px;
      object-contain: contain;
    }
    h1 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #ffffff;
    }
    p.desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .tips-box {
      background: rgba(239, 68, 68, 0.1);
      border: 1px dashed rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #fca5a5;
      text-align: left;
    }
    .tips-step {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }
    .tips-step:last-child { margin-bottom: 0; }
    .step-num {
      width: 18px;
      height: 18px;
      background: #ef4444;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      flex-shrink: 0;
    }
    .btn-copy {
      width: 100%;
      background: #e11d48;
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
      transition: all 0.2s;
    }
    .btn-copy:active {
      transform: scale(0.98);
      background: #be123c;
    }
    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 30px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wechat-arrow">
    <div class="arrow-icon">↗</div>
    <div class="arrow-text">点击右上角 ··· </div>
  </div>

  <div class="card">
    <img src="/showtime-logo-dark.png" alt="ShowTime" class="logo" onerror="this.src='/icon-192.png'">
    <h1>请在外部浏览器中打开</h1>
    <p class="desc">为保障门票抢购与演出周边的顺畅访问，微信内置环境已启用安全分流保护。</p>

    <div class="tips-box">
      <div class="tips-step">
        <span class="step-num">1</span>
        <span>点击屏幕右上角 <strong>「 ··· 」</strong> 按钮</span>
      </div>
      <div class="tips-step">
        <span class="step-num">2</span>
        <span>在弹出菜单中选择 <strong>「在浏览器打开」</strong></span>
      </div>
    </div>

    <button class="btn-copy" onclick="copyLink()">一键复制目标网址</button>
  </div>

  <div class="footer">
    © 2026 ShowTime 展泰文化 · 智能流量分发中枢
  </div>

  <script>
    function copyLink() {
      const url = "${safeUrl}";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showToast);
      } else {
        const input = document.createElement('textarea');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast();
      }
    }
    function showToast() {
      const btn = document.querySelector('.btn-copy');
      const origin = btn.innerText;
      btn.innerText = '✓ 目标网址已复制！请粘贴到浏览器';
      btn.style.background = '#059669';
      setTimeout(() => {
        btn.innerText = origin;
        btn.style.background = '#e11d48';
      }, 3000);
    }
  </script>
</body>
</html>`
}

export default eventHandler(async (event) => {
  const { pathname: slug } = parsePath(event.path.replace(/^\/|\/$/g, '')) // remove leading and trailing slashes
  const { slugRegex, reserveSlug } = useAppConfig(event)
  const { homeURL, linkCacheTtl, redirectWithQuery } = useRuntimeConfig(event)
  const { cloudflare } = event.context

  if (event.path === '/' && homeURL)
    return sendRedirect(event, homeURL)

  if (slug && !reserveSlug.includes(slug) && slugRegex.test(slug) && cloudflare) {
    const { KV } = cloudflare.env
    const link: z.infer<typeof LinkSchema> | null = await KV.get(`link:${slug}`, { type: 'json', cacheTtl: linkCacheTtl })
    if (link) {
      event.context.link = link
      try {
        await useAccessLog(event)
      }
      catch (error) {
        console.error('Failed write access log:', error)
      }

      const now = Math.floor(Date.now() / 1000)

      // 1. 定时失效检测 (Expiration Check)
      if (link.expiration && now > link.expiration) {
        const fallback = link.fallbackUrl || '/expired'
        return sendRedirect(event, fallback, 302)
      }

      // 2. 微信环境感知与防封分流 (WeChat Environment Check)
      const userAgent = getHeader(event, 'user-agent') || ''
      const isWeChat = /MicroMessenger/i.test(userAgent)

      const target = redirectWithQuery ? withQuery(link.url, getQuery(event)) : link.url

      if (isWeChat) {
        // A. 开启防封遮罩引导
        if (link.wechatShield) {
          setHeader(event, 'content-type', 'text/html; charset=utf-8')
          return renderWeChatShieldHtml(target, link.comment || link.title)
        }
        // B. 配置了微信专属直达落地页
        if (link.wechatUrl) {
          const wechatTarget = redirectWithQuery ? withQuery(link.wechatUrl, getQuery(event)) : link.wechatUrl
          return sendRedirect(event, wechatTarget, +useRuntimeConfig(event).redirectStatusCode)
        }
      }

      // 3. 正常标准重定向
      return sendRedirect(event, target, +useRuntimeConfig(event).redirectStatusCode)
    }
  }
})
