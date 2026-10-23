import { describe, it, expect, beforeEach } from 'vitest'
import { useOffsetPagination } from '../useOffsetPagination'

describe('useOffsetPagination', () => {
  it('initializes with defaults', () => {
    const p = useOffsetPagination(10)
    expect(p.page.value).toBe(1)
    expect(p.perPage.value).toBe(10)
    expect(p.total.value).toBe(0)
  })

  it('queryParams reflects current state', () => {
    const p = useOffsetPagination(15)
    expect(p.queryParams.value).toEqual({ page: 1, per_page: 15, with_total: true })
  })

  it('onPage updates page and perPage (0-based to 1-based)', () => {
    const p = useOffsetPagination()
    p.onPage({ page: 2, rows: 50 } as never)
    expect(p.page.value).toBe(3)
    expect(p.perPage.value).toBe(50)
  })

  it('syncMeta updates all fields', () => {
    const p = useOffsetPagination()
    p.syncMeta({ current_page: 3, per_page: 25, total: 200, last_page: 8 })
    expect(p.page.value).toBe(3)
    expect(p.perPage.value).toBe(25)
    expect(p.total.value).toBe(200)
  })

  it('reset reverts page to 1 and total to 0', () => {
    const p = useOffsetPagination()
    p.onPage({ page: 4, rows: 20 } as never)
    p.reset()
    expect(p.page.value).toBe(1)
    expect(p.total.value).toBe(0)
    expect(p.perPage.value).toBe(20) // perPage preserved
  })
})
