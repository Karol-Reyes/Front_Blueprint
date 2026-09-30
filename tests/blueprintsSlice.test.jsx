import { describe, it, expect } from 'vitest'
import reducer, {
  appendPoint,
  deleteBlueprint,
  removeBlueprintLocally,
  replaceBlueprintPoints,
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

  it('replaces points after an UPDATED socket event', () => {
    const blueprint = { author: 'ana', name: 'casa', points: [{ x: 1, y: 2 }] }
    const state = {
      authors: ['ana'],
      byAuthor: { ana: [blueprint] },
      current: blueprint,
      status: 'succeeded',
      error: null,
    }
    const points = [{ x: 1, y: 1 }, { x: 2, y: 2 }]

    const updated = reducer(
      state,
      replaceBlueprintPoints({ author: 'ana', name: 'casa', points }),
    )

    expect(updated.current.points).toEqual(points)
    expect(updated.byAuthor.ana[0].points).toEqual(points)
  })

  it('removes the blueprint after a DELETED socket event', () => {
    const blueprint = { author: 'ana', name: 'casa', points: [{ x: 1, y: 2 }] }
    const state = {
      authors: ['ana'],
      byAuthor: { ana: [blueprint] },
      current: blueprint,
      status: 'succeeded',
      error: null,
    }

    const updated = reducer(state, removeBlueprintLocally({ author: 'ana', name: 'casa' }))

    expect(updated.current).toBeNull()
    expect(updated.byAuthor.ana).toBeUndefined()
    expect(updated.authors).toEqual([])
  })
})
