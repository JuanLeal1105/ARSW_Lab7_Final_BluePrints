import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as reactRedux from 'react-redux'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'
import { fetchByAuthor } from '../src/features/blueprints/blueprintsSlice.js'
import * as socketIoClient from '../src/lib/socketIoClient.js'

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux')
  return { ...actual, useDispatch: vi.fn(), useSelector: vi.fn() }
})

vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchByAuthor: vi.fn(),
  fetchAllBlueprints: vi.fn(),
  selectTop5Blueprints: vi.fn(() => []),
  showAllInTable: vi.fn(),
  deleteBlueprintOptimistic: vi.fn()
}))

const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn()
}
vi.mock('../src/lib/socketIoClient.js', () => ({
  createSocket: vi.fn(() => mockSocket)
}))

describe('BlueprintsPage', () => {
  
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

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

    fireEvent.change(screen.getByPlaceholderText(/Buscar por autor.../i), { target: { value: 'pepo' } })
    fireEvent.click(screen.getByText(/Search/i))

    expect(mockDispatch).toHaveBeenCalled()
    expect(fetchByAuthor).toHaveBeenCalledWith('pepo')
  })

  it('muestra el total de puntos calculados por autor', () => {
    reactRedux.useDispatch.mockReturnValue(vi.fn())
    
    reactRedux.useSelector.mockImplementation((selector) => {
      const state = {
        blueprints: {
          searchResults: [
            { author: 'pepo', name: 'plano1', points: [{}, {}] },
            { author: 'pepo', name: 'plano2', points: [{}] }      
          ],
          listStatus: 'succeeded',
          listError: null
        }
      }
      return selector(state)
    })

    render(
      <BrowserRouter>
        <BlueprintsPage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Buscar por autor.../i), { target: { value: 'pepo' } })
    
    expect(screen.getByText(/Total de puntos dibujados: 3/i)).toBeInTheDocument()
  })

  it('se conecta al socket y escucha refresh-dashboard al montar', () => {
    reactRedux.useDispatch.mockReturnValue(vi.fn())
    reactRedux.useSelector.mockImplementation((selector) => 
      selector({ blueprints: { searchResults: [], listStatus: 'idle', listError: null } })
    )

    render(
      <BrowserRouter>
        <BlueprintsPage />
      </BrowserRouter>
    )

    expect(socketIoClient.createSocket).toHaveBeenCalled()
    expect(mockSocket.on).toHaveBeenCalledWith('refresh-dashboard', expect.any(Function))
  })
})