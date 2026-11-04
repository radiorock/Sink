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
  expiration: z.number().int().safe().refine(expiration => expiration > Math.floor(Date.now() / 1000), {
    message: '过期时间必须大于当前时间',
    path: ['expiration'],
  }).describe('到期时间 (可选)').optional(),
  title: z.string().trim().max(2048).optional(),
  description: z.string().trim().max(2048).optional(),
  image: z.string().trim().url().max(2048).optional(),
})
