import { describe, it, expect } from 'vitest'
import { useCursorPagination } from '../useCursorPagination'

describe('useCursorPagination', () => {
  it('initializes with nulls', () => {
    const p = useCursorPagination(20)
    expect(p.nextCursor.value).toBeNull()
    expect(p.prevCursor.value).toBeNull()
    expect(p.perPage.value).toBe(20)
  })

  it('syncCursors sets both cursors', () => {
    const p = useCursorPagination()
    p.syncCursors({ next_cursor: 'abc', prev_cursor: null })
    expect(p.nextCursor.value).toBe('abc')
    expect(p.prevCursor.value).toBeNull()
  })

  it('nextParams includes cursor when set', () => {
    const p = useCursorPagination(10)
    p.syncCursors({ next_cursor: 'xyz', prev_cursor: 'prev1' })
    expect(p.nextParams.value).toEqual({ per_page: 10, cursor: 'xyz' })
    expect(p.prevParams.value).toEqual({ per_page: 10, cursor: 'prev1' })
  })

  it('reset clears both cursors', () => {
    const p = useCursorPagination()
    p.syncCursors({ next_cursor: 'abc', prev_cursor: 'def' })
    p.reset()
    expect(p.nextCursor.value).toBeNull()
    expect(p.prevCursor.value).toBeNull()
  })

  it('nextParams cursor is undefined when no nextCursor', () => {
    const p = useCursorPagination()
    expect(p.nextParams.value.cursor).toBeUndefined()
  })
})
