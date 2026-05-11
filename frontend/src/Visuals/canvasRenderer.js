import { drawNode } from './nodeRenderer'

export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}

export function renderGarden(ctx, nodes, width, height) {
  clearCanvas(ctx, width, height)

  nodes.forEach(node => {
    drawNode(ctx, node)
  })
}