import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import * as reactRedux from 'react-redux'
import BlueprintDetailPage from '../src/pages/BlueprintDetailPage.jsx'
import * as socketIoClient from '../src/lib/socketIoClient.js'

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux')
  return { ...actual, useDispatch: vi.fn(), useSelector: vi.fn() }
})

const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn(),
  connected: true
}
vi.mock('../src/lib/socketIoClient.js', () => ({
  createSocket: vi.fn(() => mockSocket)
}))

describe('BlueprintDetailPage (WebSockets)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    reactRedux.useDispatch.mockReturnValue(vi.fn())
    
    reactRedux.useSelector.mockImplementation((selector) => 
      selector({ 
        blueprints: { 
          current: { author: 'pepo', name: 'lab-ws', points: [] }, 
          detailStatus: 'succeeded' 
        } 
      })
    )
  })

  it('Se conecta y emite "join-room" al montar el componente', () => {
    render(
      <MemoryRouter initialEntries={['/blueprint/pepo/lab-ws']}>
        <Routes>
          <Route path="/blueprint/:author/:name" element={<BlueprintDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(socketIoClient.createSocket).toHaveBeenCalled()
    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'blueprints.pepo.lab-ws')
    expect(mockSocket.on).toHaveBeenCalledWith('blueprint-update', expect.any(Function))
  })

  it('Emite un "draw-event" con las coordenadas al hacer clic en el canvas', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/blueprint/pepo/lab-ws']}>
        <Routes>
          <Route path="/blueprint/:author/:name" element={<BlueprintDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    const canvas = container.querySelector('canvas')
    fireEvent.click(canvas, { clientX: 150, clientY: 200 })

    expect(mockSocket.emit).toHaveBeenCalledWith('draw-event', expect.objectContaining({
      room: 'blueprints.pepo.lab-ws',
      author: 'pepo',
      name: 'lab-ws'
    }))
  })
})