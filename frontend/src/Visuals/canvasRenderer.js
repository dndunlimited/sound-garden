import { APP_CONFIG } from '../config/appConfig'
import { drawHarmonicConnections } from './harmonicRenderer'
import { drawNode } from './nodeRenderer'
import { drawPitchGrid } from './pitchGridRenderer'

export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}

export function renderGarden(ctx,nodes,width,height,mode,pitchGrid) {
  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = APP_CONFIG.canvas.background
  ctx.fillRect(0, 0, width, height)

  const time = performance.now()

  drawPitchGrid(ctx, pitchGrid, width, height)

  if (mode === APP_CONFIG.audio.modes.HARMONICS) {
    drawHarmonicConnections(ctx, nodes, time)
  }

  nodes.forEach(node => {
    drawNode(ctx, node, time)
  })
}