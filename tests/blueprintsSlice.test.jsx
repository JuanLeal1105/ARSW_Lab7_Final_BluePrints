import { describe, it, expect } from 'vitest'
import reducer, { showAllInTable } from '../src/features/blueprints/blueprintsSlice.js'

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
})