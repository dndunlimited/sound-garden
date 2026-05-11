import { mapFrequencyToHue } from './colorUtils'
 export function drawNode(ctx, node) {
  console.log('Drawing node:', node)
  const hue = mapFrequencyToHue(node.frequency)

  const gradient = ctx.createRadialGradient(
    node.x,
    node.y,
    2,
    node.x,
    node.y,
    24
  )

  gradient.addColorStop(0, `hsla(${hue}, 100%, 75%, 1)`)
  gradient.addColorStop(0.45, `hsla(${hue}, 100%, 55%, 0.65)`)
  gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(node.x, node.y, 24, 0, Math.PI * 2)
  ctx.fill() 
}