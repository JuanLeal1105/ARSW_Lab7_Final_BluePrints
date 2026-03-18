import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateBlueprintModal from '../src/components/CreateBlueprintModal.jsx'

vi.mock('../src/hooks/usePost.js', () => {
  return {
    default: () => ({
      postData: vi.fn().mockResolvedValue({}),
      isLoading: false,
      error: null
    })
  }
})

describe('CreateBlueprintModal', () => {
  it('no se renderiza si isOpen es falso', () => {
    const { container } = render(<CreateBlueprintModal isOpen={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('permite escribir en los inputs de autor y nombre', () => {
    render(<CreateBlueprintModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)

    const authorInput = screen.getAllByRole('textbox')[0] // El primero suele ser un type="text"
    fireEvent.change(authorInput, { target: { value: 'pepo' } })
    
    expect(authorInput.value).toBe('pepo')
  })
})