import { getPlotPoint, getPlotPointForBounds, ORIGINAL_PLOT_BOUNDS } from './plotGeometry'

export function drawPitchGrid(ctx, pitchGrid, width, height) {
  if (!pitchGrid?.notes || !pitchGrid?.octaves) return

  drawOriginalPitchGrid(ctx, pitchGrid, width, height)
}

export function drawImageCoordinateGrid(ctx, pitchGrid, width, height, options = {}) {
  const notes = pitchGrid?.canvasNotes || pitchGrid?.notes || []
  const octaves = pitchGrid?.canvasOctaves || []
  const columnCount = notes.length || 13
  const rowCount = octaves.length || 4
  const { showLabels = false } = options

  ctx.save()
  ctx.lineJoin = 'round'
  ctx.strokeStyle = showLabels
    ? 'rgba(255, 244, 199, 0.42)'
    : 'rgba(139, 247, 255, 0.34)'
  ctx.lineWidth = 1.5
  ctx.fillStyle = showLabels
    ? 'rgba(255, 244, 199, 0.045)'
    : 'rgba(36, 241, 255, 0.055)'

  drawBackgroundGridFill(ctx, width, height)
  drawBackgroundGridLines(ctx, width, height, columnCount, rowCount, showLabels)

  if (showLabels) {
    drawAudioGridLabels(ctx, pitchGrid, width, height, columnCount, rowCount)
  }

  ctx.restore()
}

function drawBackgroundGridLines(ctx, width, height, columnCount, rowCount, showLabels) {
  for (let index = 0; index <= columnCount; index += 1) {
    const u = index / columnCount
    drawRoadVerticalLine(ctx, width, height, u)
  }

  for (let index = 0; index <= rowCount; index += 1) {
    const v = index / rowCount
    const left = getPlotPoint(width, height, 0, v)
    const right = getPlotPoint(width, height, 1, v)

    drawLine(ctx, left, right)
  }

  ctx.save()
  ctx.strokeStyle = showLabels
    ? 'rgba(255, 250, 210, 0.92)'
    : 'rgba(255, 250, 210, 0.72)'
  ctx.lineWidth = showLabels ? 2.2 : 2
  drawCoordinateOutline(ctx, width, height)
  ctx.restore()
}

function drawRoadVerticalLine(ctx, width, height, u) {
  ctx.beginPath()

  for (let step = 0; step <= 36; step += 1) {
    const v = step / 36
    const point = getPlotPoint(width, height, u, v)

    if (step === 0) {
      ctx.moveTo(point.x, point.y)
    } else {
      ctx.lineTo(point.x, point.y)
    }
  }

  ctx.stroke()
}

function drawBackgroundGridFill(ctx, width, height) {
  const topLeft = getPlotPoint(width, height, 0, 0)
  const topRight = getPlotPoint(width, height, 1, 0)
  const bottomRight = getPlotPoint(width, height, 1, 1)
  const bottomLeft = getPlotPoint(width, height, 0, 1)

  ctx.beginPath()
  ctx.moveTo(topLeft.x, topLeft.y)
  ctx.lineTo(topRight.x, topRight.y)
  ctx.lineTo(bottomRight.x, bottomRight.y)
  ctx.lineTo(bottomLeft.x, bottomLeft.y)
  ctx.closePath()
  ctx.fill()
}

function drawOriginalPitchGrid(ctx, pitchGrid, width, height) {
  const notes = pitchGrid.canvasNotes || pitchGrid.notes
  const octaves = pitchGrid.canvasOctaves || pitchGrid.octaves

  ctx.save()

  ctx.strokeStyle = 'rgba(255, 244, 199, 0.28)'
  ctx.lineWidth = 1
  ctx.fillStyle = 'rgba(255, 249, 219, 0.82)'
  ctx.font = '11px Arial'

  for (let index = 0; index <= notes.length; index += 1) {
    const u = index / notes.length
    const top = getPlotPointForBounds(ORIGINAL_PLOT_BOUNDS, width, height, u, 0)
    const bottom = getPlotPointForBounds(ORIGINAL_PLOT_BOUNDS, width, height, u, 1)

    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.lineTo(bottom.x, bottom.y)
    ctx.stroke()
  }

  notes.forEach((note, index) => {
    const labelPoint = getPlotPointForBounds(
      ORIGINAL_PLOT_BOUNDS,
      width,
      height,
      (index + 0.5) / notes.length,
      1
    )

    ctx.textAlign = 'center'
    ctx.fillText(note, labelPoint.x, labelPoint.y - 8)
  })

  for (let index = 0; index <= octaves.length; index += 1) {
    const v = index / octaves.length
    const left = getPlotPointForBounds(ORIGINAL_PLOT_BOUNDS, width, height, 0, v)
    const right = getPlotPointForBounds(ORIGINAL_PLOT_BOUNDS, width, height, 1, v)

    ctx.beginPath()
    ctx.moveTo(left.x, left.y)
    ctx.lineTo(right.x, right.y)
    ctx.stroke()
  }

  octaves.forEach((octave, index) => {
    const labelPoint = getPlotPointForBounds(
      ORIGINAL_PLOT_BOUNDS,
      width,
      height,
      0,
      (index + 0.14) / octaves.length
    )

    ctx.textAlign = 'left'
    ctx.fillText(`Oct ${octave}`, labelPoint.x + 8, labelPoint.y)
  })

  ctx.strokeStyle = 'rgba(255, 250, 210, 0.68)'
  ctx.lineWidth = 2
  drawCoordinateOutline(ctx, width, height, ORIGINAL_PLOT_BOUNDS)

  ctx.restore()
}

function drawLine(ctx, start, end) {
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

function drawCoordinateOutline(ctx, width, height, bounds = null) {
  const getPoint = bounds
    ? (u, v) => getPlotPointForBounds(bounds, width, height, u, v)
    : (u, v) => getPlotPoint(width, height, u, v)
  const topLeft = getPoint(0, 0)
  const topRight = getPoint(1, 0)
  const bottomRight = getPoint(1, 1)
  const bottomLeft = getPoint(0, 1)

  ctx.beginPath()
  ctx.moveTo(topLeft.x, topLeft.y)
  ctx.lineTo(topRight.x, topRight.y)
  if (bounds) {
    ctx.lineTo(bottomRight.x, bottomRight.y)
    ctx.lineTo(bottomLeft.x, bottomLeft.y)
    ctx.closePath()
  } else {
    for (let step = 1; step <= 36; step += 1) {
      const point = getPlotPoint(width, height, 1, step / 36)
      ctx.lineTo(point.x, point.y)
    }
    ctx.lineTo(bottomLeft.x, bottomLeft.y)
    for (let step = 35; step >= 0; step -= 1) {
      const point = getPlotPoint(width, height, 0, step / 36)
      ctx.lineTo(point.x, point.y)
    }
    ctx.closePath()
  }
  ctx.stroke()
}

function drawAudioGridLabels(ctx, pitchGrid, width, height, columnCount, rowCount) {
  const notes = pitchGrid?.canvasNotes || pitchGrid?.notes || []
  const octaves = pitchGrid?.canvasOctaves || []

  ctx.save()
  ctx.fillStyle = 'rgba(255, 249, 219, 0.88)'
  ctx.font = '11px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  notes.forEach((note, index) => {
    const labelPoint = getPlotPoint(width, height, (index + 0.5) / columnCount, 0.96)

    ctx.fillText(note, labelPoint.x, labelPoint.y)
  })

  octaves.forEach((octave, index) => {
    const labelPoint = getPlotPoint(width, height, 0.035, (index + 0.5) / rowCount)

    ctx.textAlign = 'left'
    ctx.fillText(`Oct ${octave}`, labelPoint.x, labelPoint.y)
  })

  ctx.restore()
}
