import type { z } from 'zod'
import type { SelectStatement } from 'sql-bricks'
import type { FilterSchema, QuerySchema } from '@/schemas/query'

export type Query = z.infer<typeof QuerySchema>
export type Filter = z.infer<typeof FilterSchema>

export function appendTimeFilter(sql: SelectStatement, query: Query): unknown {
  if (query.startAt)
    sql.where(SqlBricks.gte('timestamp', SqlBricks(`toDateTime(${query.startAt})`)))

  if (query.endAt)
    sql.where(SqlBricks.lte('timestamp', SqlBricks(`toDateTime(${query.endAt})`)))

  return sql
}

export function buildStatsWhere(sql: SelectStatement, query: Query) {
  const targetId = query.id
  const targetSlug = query.slug

  // 1. 短链与二级域名全通道聚合 (解决 Nuxt 短链 index1=id 与 Worker 二级域名 index1=slug 的数据壁垒)
  if (targetId && targetSlug) {
    sql.where(SqlBricks.or(
      SqlBricks.equal('index1', targetId),
      SqlBricks.equal('blob1', targetSlug),
      SqlBricks.equal('index1', targetSlug),
      SqlBricks.equal('blob1', targetId),
    ))
  }
  else if (targetId) {
    sql.where(SqlBricks.or(
      SqlBricks.equal('index1', targetId),
      SqlBricks.equal('blob1', targetId),
    ))
  }
  else if (targetSlug) {
    sql.where(SqlBricks.or(
      SqlBricks.equal('blob1', targetSlug),
      SqlBricks.equal('index1', targetSlug),
    ))
  }

  // 2. 其余维度过滤 (如 referer, country, os, browser 等)
  Object.keys(logsMap).forEach((key) => {
    if (key === 'slug' || key === 'url')
      return
    // @ts-expect-error dynamic key
    if (query[key]) {
      // @ts-expect-error dynamic key
      sql.where(SqlBricks.equal(logsMap[key], query[key]))
    }
  })

  // 3. 时间范围过滤
  appendTimeFilter(sql, query)

  return sql
}

export function query2filter(query: Query): Filter {
  const filter: Filter = {}
  if (query.id)
    filter.index1 = query.id

  Object.keys(logsMap).forEach((key) => {
    // @ts-expect-error todo
    if (query[key]) {
      // @ts-expect-error todo
      filter[logsMap[key]] = query[key]
    }
  })
  return filter
}
