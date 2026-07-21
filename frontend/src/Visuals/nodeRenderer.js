import { mapFrequencyToHue } from './colorUtils'
import { getPlantType } from './plantCatalog'
import { getMushroomType } from './mushroomCatalog'
import { getVisualAssetFileUrl } from '../api/visualAssetApi'

const visualAssetImages = new Map()

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
  const glowEnabled = node.isGlowEnabled ?? true
  const motionEnabled = node.isMotionEnabled ?? true
  const pulseSpeed = 0.003
  const pulseAmount = 6
  const pulse = motionEnabled
    ? Math.sin(time * pulseSpeed + id) * pulseAmount
    : 0
  const radius = Math.max(4, 18 + pulse)
  const glowRadius = Math.max(6, (32 + pulse * 1.5) * 0.72)

  if (!Number.isFinite(glowRadius)) {
    console.warn('Invalid glow radius:', { node, time, glowRadius })
    return
  }

  ctx.save()
  if (node.visualType === 'asset') {
    if (glowEnabled) {
      drawGlow(ctx, x, y - radius * 1.2, hue, glowRadius)
    }
    drawVisualAsset(ctx, x, y, node.visualAssetId, radius)
  } else if (node.visualType === 'mushroom') {
    const mushroom = getMushroomType(node.plantType)
    const mushroomPulse = motionEnabled
      ? Math.sin(time * pulseSpeed * 0.5 + id) * pulseAmount
      : 0
    const mushroomStemRadius = 18 * mushroom.scale
    const mushroomCapRadius = Math.max(4, 18 + mushroomPulse) * mushroom.scale

    if (glowEnabled) {
      drawGlow(ctx, x, y - getMushroomStemHeight(mushroomStemRadius, mushroom.stem), hue, glowRadius)
    }
    drawMushroom(ctx, x, y, hue, mushroomStemRadius, mushroomCapRadius, mushroom, mushroomPulse, motionEnabled)
  } else {
    const plant = getPlantType(node.plantType)
    const bloomY = y - getPlantStemHeight(plant)

    if (glowEnabled) {
      drawGlow(ctx, x, bloomY, hue, glowRadius)
    }
    drawStemAndLeaves(ctx, x, y, plant, pulse)
    drawBloom(ctx, x, bloomY, hue, radius * plant.scale, plant, pulse)
  }
  ctx.restore()
}

function drawVisualAsset(ctx, x, y, visualAssetId, radius) {
  const image = getVisualAssetImage(visualAssetId)
  const size = Math.max(28, radius * 2.4)

  if (!image || !image.complete || image.naturalWidth === 0) {
    ctx.fillStyle = 'rgba(235, 244, 225, 0.88)'
    ctx.strokeStyle = 'rgba(40, 81, 48, 0.48)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.roundRect(x - size * 0.5, y - size, size, size, 6)
    ctx.fill()
    ctx.stroke()
    return
  }

  const sourceRatio = image.naturalWidth / image.naturalHeight
  const drawWidth = sourceRatio >= 1 ? size : size * sourceRatio
  const drawHeight = sourceRatio >= 1 ? size / sourceRatio : size

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x - drawWidth * 0.5, y - drawHeight, drawWidth, drawHeight, 6)
  ctx.clip()
  ctx.drawImage(image, x - drawWidth * 0.5, y - drawHeight, drawWidth, drawHeight)
  ctx.restore()
}

function getVisualAssetImage(visualAssetId) {
  if (!visualAssetId) return null

  if (!visualAssetImages.has(visualAssetId)) {
    const image = new Image()

    image.src = getVisualAssetFileUrl(visualAssetId)
    visualAssetImages.set(visualAssetId, image)
  }

  return visualAssetImages.get(visualAssetId)
}

function drawMushroom(ctx, x, y, hue, stemRadius, capRadius, mushroom, pulse, motionEnabled) {
  if (mushroom.cap === 'cluster') {
    drawMushroomCluster(ctx, x, y, hue, stemRadius, capRadius, mushroom, pulse, motionEnabled)
    return
  }

  if (mushroom.cap === 'twin') {
    drawMushroomBody(ctx, x - stemRadius * 0.34, y, hue + 12, stemRadius * 0.78, capRadius * 0.78, mushroom, pulse, motionEnabled)
    drawMushroomBody(ctx, x + stemRadius * 0.28, y, hue - 14, stemRadius * 0.92, capRadius * 0.92, mushroom, pulse, motionEnabled)
    return
  }

  drawMushroomBody(ctx, x, y, hue, stemRadius, capRadius, mushroom, pulse, motionEnabled)
}

function drawMushroomBody(ctx, x, y, hue, stemRadius, capRadius, mushroom, pulse, motionEnabled) {
  const stemHeight = getMushroomStemHeight(stemRadius, mushroom.stem)
  const stemWidth = getMushroomStemWidth(stemRadius, mushroom.stem)
  const lean = motionEnabled ? Math.sin(pulse * 0.18 + stemRadius) * 2 : 0
  const capY = y - stemHeight
  const capX = x + lean
  const stemTopY = capY + stemRadius * 0.05
  const stemMidY = capY + stemHeight * 0.5
  const stemBaseY = y
  const lowerLean = lean * 0.12

  const stemGradient = ctx.createLinearGradient(x - stemWidth, stemTopY, x + stemWidth, stemBaseY)
  stemGradient.addColorStop(0, 'rgba(255, 241, 205, 0.96)')
  stemGradient.addColorStop(0.55, 'rgba(226, 199, 158, 0.94)')
  stemGradient.addColorStop(1, 'rgba(159, 119, 83, 0.92)')

  ctx.fillStyle = stemGradient
  ctx.beginPath()
  ctx.moveTo(x - stemWidth * 0.55, stemBaseY)
  ctx.quadraticCurveTo(x - stemWidth * 0.66, capY + stemHeight * 0.74, x - stemWidth * 0.52 + lowerLean, stemMidY)
  ctx.quadraticCurveTo(capX - stemWidth * 0.58, capY + stemHeight * 0.24, capX - stemWidth * 0.28, stemTopY)
  ctx.lineTo(capX + stemWidth * 0.28, stemTopY)
  ctx.quadraticCurveTo(capX + stemWidth * 0.58, capY + stemHeight * 0.24, x + stemWidth * 0.52 + lowerLean, stemMidY)
  ctx.quadraticCurveTo(x + stemWidth * 0.66, capY + stemHeight * 0.74, x + stemWidth * 0.55, stemBaseY)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(89, 62, 41, 0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.strokeStyle = 'rgba(111, 79, 54, 0.24)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(capX, stemTopY + stemRadius * 0.08)
  ctx.quadraticCurveTo(x + lowerLean, stemMidY, x + stemWidth * 0.08, stemBaseY - stemRadius * 0.12)
  ctx.stroke()

  drawMushroomCap(ctx, capX, capY, hue, capRadius, mushroom)
  drawMushroomSpots(ctx, capX, capY, hue, capRadius, mushroom)
}

function getMushroomStemHeight(radius, stem) {
  if (stem === 'short') return radius * 0.9
  if (stem === 'tall') return radius * 1.55
  if (stem === 'thin') return radius * 1.32

  return radius * 1.12
}

function getMushroomStemWidth(radius, stem) {
  if (stem === 'thin') return radius * 0.34
  if (stem === 'stout') return radius * 0.62

  return radius * 0.48
}

function drawMushroomCap(ctx, x, y, hue, radius, mushroom) {
  const capGradient = ctx.createRadialGradient(
    x - radius * 0.22,
    y - radius * 0.56,
    radius * 0.08,
    x,
    y - radius * 0.18,
    radius * 1.08
  )

  capGradient.addColorStop(0, `hsla(${hue + 32}, 78%, 74%, 0.98)`)
  capGradient.addColorStop(0.48, `hsla(${hue + 18}, 68%, 52%, 0.97)`)
  capGradient.addColorStop(1, `hsla(${hue - 12}, 54%, 31%, 0.98)`)

  ctx.fillStyle = capGradient
  ctx.strokeStyle = `hsla(${hue - 16}, 54%, 34%, 0.45)`
  ctx.lineWidth = 1.2
  ctx.beginPath()

  if (mushroom.cap === 'bell' || mushroom.cap === 'ghost') {
    ctx.moveTo(x - radius * 0.72, y + radius * 0.08)
    ctx.quadraticCurveTo(x - radius * 0.34, y - radius * 0.95, x, y - radius * 1.02)
    ctx.quadraticCurveTo(x + radius * 0.34, y - radius * 0.95, x + radius * 0.72, y + radius * 0.08)
    ctx.quadraticCurveTo(x, y + radius * 0.34, x - radius * 0.72, y + radius * 0.08)
  } else if (mushroom.cap === 'parasol' || mushroom.cap === 'fan') {
    ctx.moveTo(x - radius * 1.05, y + radius * 0.06)
    ctx.quadraticCurveTo(x, y - radius * 0.72, x + radius * 1.05, y + radius * 0.06)
    ctx.quadraticCurveTo(x, y + radius * 0.28, x - radius * 1.05, y + radius * 0.06)
  } else if (mushroom.cap === 'ink') {
    ctx.moveTo(x - radius * 0.58, y - radius * 0.2)
    ctx.quadraticCurveTo(x, y - radius * 1.12, x + radius * 0.58, y - radius * 0.2)
    ctx.quadraticCurveTo(x + radius * 0.38, y + radius * 0.46, x, y + radius * 0.38)
    ctx.quadraticCurveTo(x - radius * 0.38, y + radius * 0.46, x - radius * 0.58, y - radius * 0.2)
  } else if (mushroom.cap === 'cup') {
    ctx.ellipse(x, y - radius * 0.18, radius * 0.72, radius * 0.38, 0, 0, Math.PI * 2)
  } else if (mushroom.cap === 'morel') {
    ctx.ellipse(x, y - radius * 0.35, radius * 0.46, radius * 0.86, 0, 0, Math.PI * 2)
  } else {
    ctx.ellipse(x, y - radius * 0.18, radius * 0.82, radius * 0.58, 0, Math.PI, Math.PI * 2)
    ctx.quadraticCurveTo(x + radius * 0.64, y + radius * 0.18, x, y + radius * 0.16)
    ctx.quadraticCurveTo(x - radius * 0.64, y + radius * 0.18, x - radius * 0.82, y - radius * 0.18)
  }

  ctx.closePath()
  ctx.fill()
  drawMushroomGills(ctx, x, y, hue, radius, mushroom)
  ctx.stroke()

  if (mushroom.cap === 'morel') {
    drawMorelTexture(ctx, x, y, hue, radius)
  }
}

function drawMushroomGills(ctx, x, y, hue, radius, mushroom) {
  if (mushroom.cap === 'morel' || mushroom.cap === 'cluster') return

  ctx.save()
  ctx.strokeStyle = `hsla(${hue - 34}, 42%, 24%, 0.28)`
  ctx.lineWidth = 0.8

  const gillCount = mushroom.cap === 'parasol' || mushroom.cap === 'fan' ? 9 : 7
  const undersideY = y + radius * 0.08

  for (let i = 0; i < gillCount; i += 1) {
    const t = gillCount === 1 ? 0 : i / (gillCount - 1)
    const offset = (t - 0.5) * radius * 1.35

    ctx.beginPath()
    ctx.moveTo(x + offset, undersideY)
    ctx.quadraticCurveTo(
      x + offset * 0.52,
      y + radius * 0.18,
      x,
      y + radius * 0.18
    )
    ctx.stroke()
  }

  ctx.fillStyle = `hsla(${hue - 28}, 40%, 20%, 0.16)`
  ctx.beginPath()
  ctx.ellipse(x, undersideY, radius * 0.66, radius * 0.13, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawMushroomSpots(ctx, x, y, hue, radius, mushroom) {
  if (mushroom.spots <= 0) return

  ctx.fillStyle = `hsla(${hue + 70}, 86%, 86%, 0.86)`

  for (let i = 0; i < mushroom.spots; i += 1) {
    const spread = mushroom.spots <= 5 ? 0.58 : 0.72
    const angle = (Math.PI * 2 * i) / mushroom.spots
    const sx = x + Math.cos(angle) * radius * spread * (i % 2 === 0 ? 0.62 : 0.34)
    const sy = y - radius * 0.22 + Math.sin(angle) * radius * 0.24

    ctx.beginPath()
    ctx.ellipse(sx, sy, radius * 0.08, radius * 0.055, angle * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawMushroomCluster(ctx, x, y, hue, stemRadius, capRadius, mushroom, pulse, motionEnabled) {
  for (let i = -2; i <= 2; i += 1) {
    const childStemRadius = stemRadius * (0.56 + (2 - Math.abs(i)) * 0.09)
    const childCapRadius = capRadius * (0.56 + (2 - Math.abs(i)) * 0.09)
    drawMushroomBody(
      ctx,
      x + i * stemRadius * 0.32,
      y,
      hue + i * 14,
      childStemRadius,
      childCapRadius,
      { ...mushroom, cap: i % 2 === 0 ? 'bell' : 'round', stem: 'thin', spots: 1 },
      pulse + i,
      motionEnabled
    )
  }
}

function drawMorelTexture(ctx, x, y, hue, radius) {
  ctx.strokeStyle = `hsla(${hue - 30}, 48%, 31%, 0.42)`
  ctx.lineWidth = 1

  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath()
    ctx.moveTo(x + i * radius * 0.16, y - radius * 0.98)
    ctx.quadraticCurveTo(x + i * radius * 0.28, y - radius * 0.42, x + i * radius * 0.12, y + radius * 0.24)
    ctx.stroke()
  }

  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath()
    ctx.ellipse(x, y - radius * 0.76 + i * radius * 0.32, radius * 0.28, radius * 0.06, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawStemAndLeaves(ctx, x, y, plant, pulse) {
  const height = getPlantStemHeight(plant)
  const prominenceScale = 1.15
  const bloomY = y - height
  const curve = Math.sin(pulse * 0.2 + plant.leafCount) * 5

  ctx.strokeStyle = 'rgba(48, 110, 52, 0.74)'
  ctx.lineWidth = (plant.bloom === 'reed' ? 1.4 : 2) * prominenceScale * 1.3
  ctx.beginPath()
  ctx.moveTo(x, bloomY + 5)
  ctx.quadraticCurveTo(x + curve, bloomY + height * 0.55, x - curve * 0.35, y)
  ctx.stroke()

  ctx.fillStyle = 'rgba(76, 132, 58, 0.82)'
  for (let i = 0; i < plant.leafCount; i += 1) {
    const side = i % 2 === 0 ? 1 : -1
    const leafY = bloomY + (16 + i * 5) * prominenceScale
    const leafX = x + side * (5 + i * 0.8) * prominenceScale

    ctx.beginPath()
    ctx.ellipse(
      leafX,
      leafY,
      (8 - i * 0.25) * prominenceScale,
      3.5 * prominenceScale,
      side * -0.55,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
}

function getPlantStemHeight(plant) {
  return (34 + plant.leafCount * 3) * 1.15
}

function drawGlow(ctx, x, y, hue, glowRadius) {
  const gradient = ctx.createRadialGradient(x, y, 2, x, y, glowRadius)

  gradient.addColorStop(0, `hsla(${hue}, 100%, 75%, 0.95)`)
  gradient.addColorStop(0.45, `hsla(${hue}, 100%, 55%, 0.44)`)
  gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
  ctx.fill()
}

function drawBloom(ctx, x, y, hue, radius, plant, pulse) {
  if (plant.bloom === 'fern') {
    drawFern(ctx, x, y, hue, radius)
    return
  }

  if (plant.bloom === 'pod') {
    drawPod(ctx, x, y, hue, radius)
    return
  }

  if (plant.bloom === 'reed') {
    drawReed(ctx, x, y, hue, radius)
    return
  }

  const petalCount = plant.petals || 6
  const petalLength = radius * (plant.bloom === 'sun' ? 0.76 : 0.58)
  const petalWidth = radius * (plant.bloom === 'bell' ? 0.18 : 0.26)

  for (let i = 0; i < petalCount; i += 1) {
    const angle = (Math.PI * 2 * i) / petalCount + pulse * 0.006
    const px = x + Math.cos(angle) * radius * 0.36
    const py = y + Math.sin(angle) * radius * 0.36

    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(angle)
    ctx.fillStyle = `hsla(${(hue + i * 8) % 360}, 88%, 68%, 0.9)`
    ctx.beginPath()

    if (plant.bloom === 'star') {
      ctx.moveTo(0, 0)
      ctx.lineTo(petalLength, -petalWidth)
      ctx.lineTo(petalLength * 0.72, 0)
      ctx.lineTo(petalLength, petalWidth)
      ctx.closePath()
    } else if (plant.bloom === 'bell' || plant.bloom === 'lily') {
      ctx.ellipse(petalLength * 0.28, 0, petalLength * 0.62, petalWidth, 0, 0, Math.PI * 2)
    } else if (plant.bloom === 'clover') {
      ctx.arc(petalLength * 0.28, 0, petalWidth * 1.2, 0, Math.PI * 2)
    } else if (plant.bloom === 'sprout') {
      ctx.ellipse(petalLength * 0.18, 0, petalLength * 0.42, petalWidth * 0.7, 0, 0, Math.PI * 2)
    } else {
      ctx.ellipse(petalLength * 0.32, 0, petalLength * 0.58, petalWidth, 0, 0, Math.PI * 2)
    }

    ctx.fill()
    ctx.restore()
  }

  ctx.fillStyle = `hsla(${hue}, 100%, 82%, 1)`
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.22, 0, Math.PI * 2)
  ctx.fill()
}

function drawFern(ctx, x, y, hue, radius) {
  ctx.strokeStyle = `hsla(${hue + 80}, 55%, 48%, 0.95)`
  ctx.lineWidth = 1.5

  for (let frond = -2; frond <= 2; frond += 1) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + frond * 5, y - radius * 0.6, x + frond * 11, y - radius)
    ctx.stroke()
  }
}

function drawPod(ctx, x, y, hue, radius) {
  ctx.fillStyle = `hsla(${hue + 45}, 72%, 62%, 0.95)`
  ctx.beginPath()
  ctx.ellipse(x, y, radius * 0.35, radius * 0.64, 0.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `hsla(${hue}, 100%, 82%, 0.9)`
  ctx.beginPath()
  ctx.arc(x, y - radius * 0.12, radius * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

function drawReed(ctx, x, y, hue, radius) {
  for (let i = -2; i <= 2; i += 1) {
    ctx.strokeStyle = `hsla(${hue + i * 12}, 72%, 66%, 0.88)`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y + radius * 0.25)
    ctx.lineTo(x + i * 4, y - radius * 0.8)
    ctx.stroke()
  }
}
