export const PLOT_BOUNDS = {
  topLeft: { x: 0.205, y: 0.53 },
  topRight: { x: 0.795, y: 0.53 },
  bottomLeft: { x: 0.055, y: 0.945 },
  bottomRight: { x: 0.945, y: 0.945 }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

export function getPlotPoint(width, height, u, v) {
  const leftX = lerp(PLOT_BOUNDS.topLeft.x, PLOT_BOUNDS.bottomLeft.x, v) * width
  const rightX = lerp(PLOT_BOUNDS.topRight.x, PLOT_BOUNDS.bottomRight.x, v) * width
  const y = lerp(PLOT_BOUNDS.topLeft.y, PLOT_BOUNDS.bottomLeft.y, v) * height

  return {
    x: lerp(leftX, rightX, u),
    y
  }
}

export function getPlotCoordinates(point, width, height) {
  const topY = PLOT_BOUNDS.topLeft.y * height
  const bottomY = PLOT_BOUNDS.bottomLeft.y * height
  const v = Math.max(0, Math.min(1, (point.y - topY) / (bottomY - topY)))
  const leftX = lerp(PLOT_BOUNDS.topLeft.x, PLOT_BOUNDS.bottomLeft.x, v) * width
  const rightX = lerp(PLOT_BOUNDS.topRight.x, PLOT_BOUNDS.bottomRight.x, v) * width
  const u = Math.max(0, Math.min(1, (point.x - leftX) / (rightX - leftX)))

  return { u, v }
}

export function getPointInPlot(point, width, height) {
  const coords = getPlotCoordinates(point, width, height)

  return getPlotPoint(width, height, coords.u, coords.v)
}
