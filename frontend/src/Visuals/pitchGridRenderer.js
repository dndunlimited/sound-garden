export function drawPitchGrid(ctx, pitchGrid, width, height) {
  if (!pitchGrid?.notes || !pitchGrid?.octaves) return

  const notes = pitchGrid.notes
  const octaves = pitchGrid.octaves

  const columnWidth = width / notes.length
  const rowHeight = height / octaves.length

  ctx.save()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.font = '11px Arial'

  // Vertical note columns
  notes.forEach((note, index) => {
    const x = index * columnWidth

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillText(
      note,
      x + columnWidth / 2,
      height - 8
    )
  })

  // Horizontal octave rows
  octaves.forEach((octave, index) => {
    const y = index * rowHeight

    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.fillText(
      `Oct ${octave}`,
      8,
      y + 16
    )
  })

  ctx.restore()
}