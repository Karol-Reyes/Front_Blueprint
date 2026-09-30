import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
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
      />,
    )
    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('emite coordenadas del canvas al hacer click', () => {
    const onPoint = vi.fn()
    const { container } = render(<BlueprintCanvas onPoint={onPoint} />)

    fireEvent.click(container.querySelector('canvas'), { clientX: 120, clientY: 80 })

    expect(onPoint).toHaveBeenCalledWith({ x: 120, y: 80 })
  })
})
