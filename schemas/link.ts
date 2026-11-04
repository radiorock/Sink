import { z } from 'zod'
import { customAlphabet } from 'nanoid'

const { slugRegex } = useAppConfig()

const slugDefaultLength = +useRuntimeConfig().public.slugDefaultLength

export const nanoid = (length: number = slugDefaultLength) => customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', length)

export const LinkSchema = z.object({
  id: z.string().trim().max(26).default(nanoid(10)),
  url: z.string().trim().url('请输入有效的链接地址 (包含 http:// 或 https://)').max(2048).describe('目标链接 (URL)'),
  slug: z.string().trim().max(2048).regex(new RegExp(slugRegex), '短链标识格式不正确').default(nanoid()).describe('短链标识 (Slug)'),
  comment: z.string().trim().max(2048).describe('备注说明 (可选)').optional(),
  createdAt: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  updatedAt: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  // 到期时间戳 (秒)
  expiration: z.number().int().safe().describe('到期时间 (可选)').optional(),
  // 到期后兜底重定向链接
  fallbackUrl: z.string().trim().url('请输入有效的兜底网址').max(2048).describe('到期兜底跳转 (URL)').optional(),
  // 微信环境专享落地页
  wechatUrl: z.string().trim().url('请输入有效的微信专享网址').max(2048).describe('微信专享落地页 (URL)').optional(),
  // 是否开启微信“在浏览器中打开”防封遮罩引导
  wechatShield: z.boolean().default(false).describe('微信防封浏览器引导').optional(),
  // 业务标签组 (如：TEN巡演, 票务早鸟, Instagram)
  tags: z.array(z.string().trim()).default([]).describe('业务项目标签').optional(),
  title: z.string().trim().max(2048).optional(),
  description: z.string().trim().max(2048).optional(),
  image: z.string().trim().url().max(2048).optional(),
})
