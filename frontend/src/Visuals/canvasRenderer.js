import { drawNode } from './nodeRenderer'
import { drawHarmonicConnections } from './harmonicRenderer'

import { APP_CONFIG } from '../config/appConfig'

export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}

export function renderGarden(ctx, nodes, width, height) {
  clearCanvas(ctx, width, height)
  ctx.fillStyle = APP_CONFIG.canvas.background
  ctx.fillRect(0, 0, width, height)
  
  const time = performance.now()

  drawHarmonicConnections(ctx, nodes, time)

  nodes.forEach(node => {
    drawNode(ctx, node, time)
  })
}