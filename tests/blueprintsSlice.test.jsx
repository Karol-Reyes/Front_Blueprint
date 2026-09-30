import { describe, it, expect } from 'vitest'
import reducer, {
  appendPoint,
  deleteBlueprint,
  updateBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('should initialize correctly', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.authors).toEqual([])
  })

  it('adds a received point to the selected blueprint and its author cache', () => {
    const blueprint = { author: 'ana', name: 'casa', points: [{ x: 1, y: 2 }] }
    const state = {
      authors: ['ana'],
      byAuthor: { ana: [blueprint] },
      current: blueprint,
      status: 'succeeded',
      error: null,
    }

    const updated = reducer(
      state,
      appendPoint({ author: 'ana', name: 'casa', point: { x: 3, y: 4 } }),
    )

    expect(updated.current.points).toHaveLength(2)
    expect(updated.byAuthor.ana[0].points).toHaveLength(2)
  })

  it('updates and removes a blueprint in Redux state', () => {
    const blueprint = { author: 'ana', name: 'casa', points: [{ x: 1, y: 2 }] }
    const state = {
      authors: ['ana'],
      byAuthor: { ana: [blueprint] },
      current: blueprint,
      status: 'succeeded',
      error: null,
    }
    const updated = reducer(
      state,
      updateBlueprint.fulfilled(
        { author: 'ana', name: 'casa', points: [{ x: 5, y: 6 }] },
        'request-id',
        {},
      ),
    )

    expect(updated.current.points).toEqual([{ x: 5, y: 6 }])

    const removed = reducer(
      updated,
      deleteBlueprint.fulfilled({ author: 'ana', name: 'casa' }, 'request-id', {}),
    )
    expect(removed.current).toBeNull()
    expect(removed.authors).toEqual([])
  })
})
