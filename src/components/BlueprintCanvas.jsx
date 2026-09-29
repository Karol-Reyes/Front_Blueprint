import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ id = 'blueprint-canvas', points = [], width = 520, height = 360 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    if (points.length === 0) return

    // Escala los puntos para que ocupen el canvas, si son puntos pequeños (ej, hasta 10) 
    // la escala aumenta para verlos mejor
    const padding = 30
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    const rangeX = maxX - minX || 1 // evita dividir por 0
    const rangeY = maxY - minY || 1

    const scaled = points.map((p) => ({
      x: padding + ((p.x - minX) / rangeX) * (canvas.width - padding * 2),
      y: padding + ((p.y - minY) / rangeY) * (canvas.height - padding * 2),
    }))
    
    if (points.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(scaled[0].x, scaled[0].y)
      for (let i = 1; i < scaled.length; i++) {
        const p = scaled[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    
    ctx.fillStyle = '#fbbf24'
    for (const p of scaled) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  return (
    <canvas
      id={id}
      ref={ref}
      width={width}
      height={height}
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 12,
        width: '100%',
        maxWidth: width,
      }}
    />
  )
}
