import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ points = [], width = 520, height = 360, onCanvasClick }) {
  const ref = useRef(null)

  const handleClick = (e) => {
    if (!onCanvasClick) return;
    
    const canvas = ref.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    
    onCanvasClick({ x, y })
  }

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    if (points && points.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) { ctx.lineTo(points[i].x, points[i].y) }
      ctx.stroke()
    }

    ctx.fillStyle = '#fbbf24'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  return (
    <canvas
      ref={ref}
      onClick={handleClick}
      width={width}
      height={height}
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 12,
        cursor: onCanvasClick ? 'crosshair' : 'default',
        width: '100%',
        maxWidth: width,
      }}
    />
  )
}