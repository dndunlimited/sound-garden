import { APP_CONFIG } from '../config/appConfig'
import gardenBackgroundUrl from '../assets/garden-canvas-bg.png'
import { drawGardenBackground } from './gardenBackgroundRenderer'
import { drawHarmonicConnections } from './harmonicRenderer'
import { drawNode } from './nodeRenderer'
import { drawPitchGrid } from './pitchGridRenderer'

const gardenBackgroundImage = new Image()
gardenBackgroundImage.src = gardenBackgroundUrl

export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}

export function renderGarden(ctx,nodes,width,height,mode,pitchGrid) {
  ctx.clearRect(0, 0, width, height)

  const time = performance.now()

  drawImageBackground(ctx, width, height, time)
  drawPitchGrid(ctx, pitchGrid, width, height)

  if (mode === APP_CONFIG.audio.modes.HARMONICS) {
    drawHarmonicConnections(ctx, nodes, time)
  }

  const sortedNodes = [...nodes].sort((a, b) => Number(a.y) - Number(b.y))

  sortedNodes.forEach(node => {
    drawNode(ctx, node, time)
  })
}

function drawImageBackground(ctx, width, height, time) {
  if (!gardenBackgroundImage.complete || gardenBackgroundImage.naturalWidth === 0) {
    drawGardenBackground(ctx, width, height, time)
    return
  }

  const imageRatio = gardenBackgroundImage.naturalWidth / gardenBackgroundImage.naturalHeight
  const canvasRatio = width / height
  let sourceX = 0
  let sourceY = 0
  let sourceWidth = gardenBackgroundImage.naturalWidth
  let sourceHeight = gardenBackgroundImage.naturalHeight

  if (imageRatio > canvasRatio) {
    sourceWidth = gardenBackgroundImage.naturalHeight * canvasRatio
    sourceX = (gardenBackgroundImage.naturalWidth - sourceWidth) / 2
  } else {
    sourceHeight = gardenBackgroundImage.naturalWidth / canvasRatio
    sourceY = (gardenBackgroundImage.naturalHeight - sourceHeight) / 2
  }

  ctx.drawImage(
    gardenBackgroundImage,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  )

  ctx.fillStyle = 'rgba(20, 30, 18, 0.08)'
  ctx.fillRect(0, 0, width, height)
}
