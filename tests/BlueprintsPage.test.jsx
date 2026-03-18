import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as reactRedux from 'react-redux'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'
import { fetchByAuthor } from '../src/features/blueprints/blueprintsSlice.js'

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux')
  return { ...actual, useDispatch: vi.fn(), useSelector: vi.fn() }
})

vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchByAuthor: vi.fn(),
  fetchAllBlueprints: vi.fn(),
  selectTop5Blueprints: vi.fn(() => []),
}))

describe('BlueprintsPage', () => {
  it('despacha fetchByAuthor al hacer click en Search', () => {
    const mockDispatch = vi.fn()
    reactRedux.useDispatch.mockReturnValue(mockDispatch)

    reactRedux.useSelector.mockImplementation((selector) => 
      selector({ blueprints: { searchResults: [], listStatus: 'idle', listError: null } })
    )

    render(
      <BrowserRouter>
        <BlueprintsPage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Ej: john/i), { target: { value: 'pepo' } })
    fireEvent.click(screen.getByText(/Search/i))

    expect(mockDispatch).toHaveBeenCalled()
    expect(fetchByAuthor).toHaveBeenCalledWith('pepo')
  })
})