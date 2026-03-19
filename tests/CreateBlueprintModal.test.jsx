import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import CreateBlueprintModal from '../src/components/CreateBlueprintModal.jsx'
import * as socketIoClient from '../src/lib/socketIoClient.js'

vi.mock('../src/hooks/usePost.js', () => {
  return {
    default: () => ({
      postData: vi.fn().mockResolvedValue({}),
      isLoading: false,
      error: null
    })
  }
})

const mockSocket = {
  emit: vi.fn(),
  disconnect: vi.fn()
}
vi.mock('../src/lib/socketIoClient.js', () => ({
  createSocket: vi.fn(() => mockSocket)
}))

describe('CreateBlueprintModal', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('no se renderiza si isOpen es falso', () => {
    const { container } = render(<CreateBlueprintModal isOpen={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('permite escribir en los inputs de autor y nombre', () => {
    render(<CreateBlueprintModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)

    const authorInput = screen.getAllByRole('textbox')[0] 
    fireEvent.change(authorInput, { target: { value: 'pepo' } })
    
    expect(authorInput.value).toBe('pepo')
  })

  it('emite dashboard-update al guardar exitosamente', async () => {
    render(<CreateBlueprintModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    
    const authorInput = screen.getAllByRole('textbox')[0]
    const nameInput = screen.getAllByRole('textbox')[1]
    const submitBtn = screen.getByText('Guardar')

    fireEvent.change(authorInput, { target: { value: 'pepo' } })
    fireEvent.change(nameInput, { target: { value: 'casa' } })

    vi.spyOn(window, 'alert').mockImplementation(() => {})
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(socketIoClient.createSocket).toHaveBeenCalled()
      expect(mockSocket.emit).toHaveBeenCalledWith('dashboard-update')
    })
  })
})