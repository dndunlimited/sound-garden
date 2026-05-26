import { getPlotPoint } from './plotGeometry'

export function drawPitchGrid(ctx, pitchGrid, width, height) {
  if (!pitchGrid?.notes || !pitchGrid?.octaves) return

  const notes = pitchGrid.canvasNotes || pitchGrid.notes
  const octaves = pitchGrid.canvasOctaves || pitchGrid.octaves

  ctx.save()

  ctx.strokeStyle = 'rgba(255, 244, 199, 0.28)'
  ctx.lineWidth = 1
  ctx.fillStyle = 'rgba(255, 249, 219, 0.82)'
  ctx.font = '11px Arial'

  // Vertical note columns
  for (let index = 0; index <= notes.length; index += 1) {
    const u = index / notes.length
    const top = getPlotPoint(width, height, u, 0)
    const bottom = getPlotPoint(width, height, u, 1)

    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.lineTo(bottom.x, bottom.y)
    ctx.stroke()
  }

  notes.forEach((note, index) => {
    const labelPoint = getPlotPoint(width, height, (index + 0.5) / notes.length, 1)

    ctx.textAlign = 'center'
    ctx.fillText(
      note,
      labelPoint.x,
      labelPoint.y - 8
    )
  })

  // Horizontal octave rows
  for (let index = 0; index <= octaves.length; index += 1) {
    const v = index / octaves.length
    const left = getPlotPoint(width, height, 0, v)
    const right = getPlotPoint(width, height, 1, v)

    ctx.beginPath()
    ctx.moveTo(left.x, left.y)
    ctx.lineTo(right.x, right.y)
    ctx.stroke()
  }

  octaves.forEach((octave, index) => {
    const labelPoint = getPlotPoint(width, height, 0, (index + 0.14) / octaves.length)

    ctx.textAlign = 'left'
    ctx.fillText(
      `Oct ${octave}`,
      labelPoint.x + 8,
      labelPoint.y
    )
  })

  ctx.restore()
}
