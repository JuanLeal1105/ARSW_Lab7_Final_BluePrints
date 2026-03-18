import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas.jsx'

describe('BlueprintCanvas', () => {
  it('renderiza un canvas y llama getContext', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    const { container } = render(
      <BlueprintCanvas
        points={[
          { x: 10, y: 10 },
          { x: 50, y: 60 },
        ]}
        onCanvasClick={vi.fn()}
      />,
    )
    
    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
    
    spy.mockRestore()
  })

  it('llama onCanvasClick al hacer clic en el lienzo', () => {
    const mockOnClick = vi.fn()
    const { container } = render(
      <BlueprintCanvas points={[]} onCanvasClick={mockOnClick} />
    )
    
    const canvas = container.querySelector('canvas')
    fireEvent.click(canvas, { clientX: 100, clientY: 100 })
    
    expect(mockOnClick).toHaveBeenCalled()
  })
})