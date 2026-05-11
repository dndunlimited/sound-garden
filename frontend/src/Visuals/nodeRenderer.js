import { mapFrequencyToHue } from './colorUtils'

export function drawNode(ctx, node, time = performance.now()) {
  if (!node) return

  const x = Number(node.x)
  const y = Number(node.y)
  const frequency = Number(node.frequency)
  const id = Number(node.id ?? 0)

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    console.warn('Invalid node position:', node)
    return
  }

  const hue = mapFrequencyToHue(frequency)

  const pulseSpeed = 0.003
  const pulseAmount = 6

  const pulse = Math.sin(time * pulseSpeed + id) * pulseAmount

  const radius = Math.max(4, 18 + pulse)
  const glowRadius = Math.max(8, 32 + pulse * 1.5)

  if (!Number.isFinite(glowRadius)) {
    console.warn('Invalid glow radius:', { node, time, glowRadius })
    return
  }

  const gradient = ctx.createRadialGradient(
    x,
    y,
    2,
    x,
    y,
    glowRadius
  )

  gradient.addColorStop(0, `hsla(${hue}, 100%, 75%, 1)`)
  gradient.addColorStop(0.45, `hsla(${hue}, 100%, 55%, 0.65)`)
  gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `hsla(${hue}, 100%, 80%, 1)`
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2)
  ctx.fill()
}