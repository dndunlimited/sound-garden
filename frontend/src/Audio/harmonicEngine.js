import { distance } from './pitchUtils'

export function calculateHarmonicFrequency(node, nodes) {
  const maxDistance = 200
  let harmonicShift = 0

  nodes.forEach(other => {
    if (node.id === other.id) return

    const d = distance(node, other)

    if (d < maxDistance) {
      const influence = 1 - d / maxDistance
      harmonicShift += influence * 20
    }
  })

  return node.frequency + harmonicShift
}