export const PLOT_BOUNDS = {
  topLeft: { x: 0.49, y: 0.65 },
  topRight: { x: 0.64, y: 0.65 },
  bottomLeft: { x: -0.02, y: 0.9 },
  bottomRight: { x: 1.03, y: 0.93 },
  leftControl: { x: 0.2, y: 0.87 },
  rightControl: { x: 0.78, y: 0.8 }
}

export const ORIGINAL_PLOT_BOUNDS = {
  topLeft: { x: 0.205, y: 0.53 },
  topRight: { x: 0.795, y: 0.53 },
  bottomLeft: { x: 0.055, y: 0.945 },
  bottomRight: { x: 0.945, y: 0.945 }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function quadraticPoint(start, control, end, amount) {
  const inverse = 1 - amount

  return {
    x: inverse * inverse * start.x + 2 * inverse * amount * control.x + amount * amount * end.x,
    y: inverse * inverse * start.y + 2 * inverse * amount * control.y + amount * amount * end.y
  }
}

function getPlotSidePoints(bounds, v) {
  if (bounds.leftControl && bounds.rightControl) {
    return {
      left: quadraticPoint(bounds.topLeft, bounds.leftControl, bounds.bottomLeft, v),
      right: quadraticPoint(bounds.topRight, bounds.rightControl, bounds.bottomRight, v)
    }
  }

  return {
    left: {
      x: lerp(bounds.topLeft.x, bounds.bottomLeft.x, v),
      y: lerp(bounds.topLeft.y, bounds.bottomLeft.y, v)
    },
    right: {
      x: lerp(bounds.topRight.x, bounds.bottomRight.x, v),
      y: lerp(bounds.topRight.y, bounds.bottomRight.y, v)
    }
  }
}

export function getPlotPointForBounds(bounds, width, height, u, v) {
  const { left, right } = getPlotSidePoints(bounds, v)

  return {
    x: lerp(left.x, right.x, u) * width,
    y: lerp(left.y, right.y, u) * height
  }
}

export function getPlotPoint(width, height, u, v) {
  return getPlotPointForBounds(PLOT_BOUNDS, width, height, u, v)
}

export function getPlotCoordinates(point, width, height) {
  let lower = 0
  let upper = 1

  for (let index = 0; index < 24; index += 1) {
    const middle = (lower + upper) / 2
    const center = getPlotPoint(width, height, 0.5, middle)

    if (center.y < point.y) {
      lower = middle
    } else {
      upper = middle
    }
  }

  const v = Math.max(0, Math.min(1, (lower + upper) / 2))
  const left = getPlotPoint(width, height, 0, v)
  const right = getPlotPoint(width, height, 1, v)
  const u = Math.max(0, Math.min(1, (point.x - left.x) / (right.x - left.x)))

  return { u, v }
}

export function getPointInPlot(point, width, height) {
  const coords = getPlotCoordinates(point, width, height)

  return getPlotPoint(width, height, coords.u, coords.v)
}
