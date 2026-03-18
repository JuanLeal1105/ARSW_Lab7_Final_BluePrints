import { describe, it, expect } from 'vitest'
import reducer, { showAllInTable, syncBlueprintPoints } from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('debería inicializar correctamente con la nueva estructura', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.allItems).toEqual([])
    expect(state.searchResults).toEqual([])
    expect(state.listStatus).toBe('idle')
  })

  it('debería manejar showAllInTable moviendo los datos a la vista', () => {
    const previousState = {
      allItems: [{ author: 'pepo', name: 'lab' }],
      searchResults: [],
      listStatus: 'succeeded'
    }
    const nextState = reducer(previousState, showAllInTable())
    expect(nextState.searchResults).toEqual([{ author: 'pepo', name: 'lab' }])
  })

  it('debería agregar puntos entrantes con syncBlueprintPoints', () => {
    const previousState = {
      current: { author: 'pepo', name: 'lab', points: [{ x: 10, y: 10 }] }
    }
    const nextState = reducer(previousState, syncBlueprintPoints({ x: 50, y: 50 }))
    
    expect(nextState.current.points).toHaveLength(2)
    expect(nextState.current.points[1]).toEqual({ x: 50, y: 50 })
  })
})