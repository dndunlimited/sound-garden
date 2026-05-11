import { APP_CONFIG } from '../config/appConfig'
import { mapFrequencyToHue } from './colorUtils'

function distance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function drawHarmonicConnections(ctx, nodes, time) {
  const maxDistance = APP_CONFIG.harmonics.maxDistance

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]

      const d = distance(a, b)

      if (d > maxDistance) continue

      const influence = 1 - d / maxDistance
      const avgFreq = (a.frequency + b.frequency) / 2
      const hue = mapFrequencyToHue(avgFreq)

      const pulse = 0.5 + Math.sin(time * 0.004 + a.id + b.id) * 0.5
      const alpha = influence * (0.15 + pulse * 0.35)

      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`
      ctx.lineWidth = 1 + influence * 3

      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }
}