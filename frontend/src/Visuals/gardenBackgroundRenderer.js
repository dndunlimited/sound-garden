export function drawGardenBackground(ctx, width, height, time = performance.now()) {
  const skyHeight = height * 0.28
  const grassHeight = height * 0.46
  const soilY = skyHeight + grassHeight

  drawSky(ctx, width, skyHeight)
  drawDistantGreenery(ctx, width, skyHeight)
  drawGrass(ctx, width, skyHeight, grassHeight, time)
  drawSoil(ctx, width, soilY, height - soilY)
}

function drawSky(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)

  gradient.addColorStop(0, '#8fc7e8')
  gradient.addColorStop(1, '#d9eef0')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawDistantGreenery(ctx, width, skyHeight) {
  ctx.save()
  ctx.fillStyle = '#496f3d'

  for (let i = 0; i < 9; i += 1) {
    const x = (i / 8) * width
    const radius = 42 + (i % 3) * 12

    ctx.beginPath()
    ctx.arc(x, skyHeight + 18, radius, Math.PI, 0)
    ctx.fill()
  }

  ctx.restore()
}

function drawGrass(ctx, width, y, height, time) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height)

  gradient.addColorStop(0, '#6b9a4d')
  gradient.addColorStop(0.58, '#3f7d3e')
  gradient.addColorStop(1, '#2f6235')

  ctx.fillStyle = gradient
  ctx.fillRect(0, y, width, height)

  ctx.save()
  ctx.strokeStyle = 'rgba(198, 232, 136, 0.22)'
  ctx.lineWidth = 1

  for (let x = 4; x < width; x += 10) {
    const sway = Math.sin(time * 0.0015 + x * 0.08) * 3
    const bladeHeight = 10 + (x % 23)

    ctx.beginPath()
    ctx.moveTo(x, y + height)
    ctx.quadraticCurveTo(x + sway, y + height - bladeHeight * 0.55, x + sway * 1.6, y + height - bladeHeight)
    ctx.stroke()
  }

  ctx.restore()
}

function drawSoil(ctx, width, y, height) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height)

  gradient.addColorStop(0, '#725339')
  gradient.addColorStop(0.5, '#5e402d')
  gradient.addColorStop(1, '#3d2a22')

  ctx.fillStyle = gradient
  ctx.fillRect(0, y, width, height)

  ctx.save()
  ctx.strokeStyle = 'rgba(245, 214, 155, 0.14)'
  ctx.lineWidth = 1

  for (let i = 0; i < 18; i += 1) {
    const lineY = y + 8 + i * (height / 18)

    ctx.beginPath()
    ctx.moveTo(0, lineY)

    for (let x = 0; x <= width; x += 40) {
      ctx.lineTo(x, lineY + Math.sin(i * 1.7 + x * 0.03) * 3)
    }

    ctx.stroke()
  }

  ctx.restore()
}
