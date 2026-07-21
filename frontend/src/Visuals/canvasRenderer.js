import { APP_CONFIG } from '../config/appConfig'
import { drawHarmonicConnections } from './harmonicRenderer'
import { drawNode } from './nodeRenderer'
import { drawImageCoordinateGrid, drawPitchGrid } from './pitchGridRenderer'

export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}

export function renderGarden(
  ctx,
  nodes,
  width,
  height,
  mode,
  pitchGrid,
  gridDisplay = APP_CONFIG.canvas.defaultGridDisplay
) {
  ctx.clearRect(0, 0, width, height)

  const time = performance.now()

  drawGridOverlay(ctx, width, height, pitchGrid, gridDisplay)

  if (mode === APP_CONFIG.audio.modes.HARMONICS) {
    drawHarmonicConnections(ctx, nodes, time)
  }

  const sortedNodes = [...nodes].sort((a, b) => Number(a.y) - Number(b.y))

  sortedNodes.forEach(node => {
    drawNode(ctx, node, time)
  })
}

function drawGridOverlay(ctx, width, height, pitchGrid, gridDisplay) {
  try {
  if (gridDisplay === APP_CONFIG.canvas.gridDisplays.HIDDEN) {
    // Background only.
  } else if (gridDisplay === APP_CONFIG.canvas.gridDisplays.ORIGINAL) {
    drawPitchGrid(ctx, pitchGrid, width, height)
  } else {
    drawImageCoordinateGrid(ctx, pitchGrid, width, height, {
      showLabels: true
    })
  }
  } catch (error) {
    console.warn('Unable to draw grid overlay:', error)
  }
}
