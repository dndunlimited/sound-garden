import { APP_CONFIG } from '../config/appConfig'
import { distance } from './pitchUtils'

// diferentiates between root and harmonic voices, allowing for more complex sound generation and modulation
const INTERVALS = [
  { name: 'octave', ratio: 2, gain: 0.025 },
  { name: 'perfectFifth', ratio: 3 / 2, gain: 0.03 },
  { name: 'perfectFourth', ratio: 4 / 3, gain: 0.02 }
]

// Calculates the frequencies and gains for a node's harmonic voices based on nearby nodes
export function calculateHarmonicVoices(node, nodes) {
  const nearbyNodes = nodes
    .filter(other => other.id !== node.id)
    .map(other => ({
      node: other,
      distance: distance(node, other)
    }))
    .filter(item => item.distance <= APP_CONFIG.harmonics.maxDistance)
    .sort((a, b) => a.distance - b.distance)

  const harmonics = nearbyNodes.slice(0, 3).map((item, index) => {
    const interval = INTERVALS[index % INTERVALS.length]
    const influence = 1 - item.distance / APP_CONFIG.harmonics.maxDistance

    return {
      name: interval.name,
      frequency: node.frequency * interval.ratio,
      gain: interval.gain * influence
    }
  })

  return {
    root: {
      frequency: node.frequency,
      gain: APP_CONFIG.audio.defaultGain
    },
    harmonics
  }
}