import { APP_CONFIG } from '../../config/appConfig'
import { distance } from '../pitchUtils'

function normalizeMode(mode) {
  return (mode ?? APP_CONFIG.audio.modes.NOTES).toLowerCase()
}

function isHarmonicsNode(node) {
  return normalizeMode(node.audioMode) === APP_CONFIG.audio.modes.HARMONICS
}

function getIntervalByType(harmonicType) {
  const intervals = {
    octave: {
      name: 'octave',
      ratio: 2.0,
      gain: 0.025
    },

    perfect_fourth: {
      name: 'perfect_fourth',
      ratio: 4 / 3,
      gain: 0.02
    },

    perfect_fifth: {
      name: 'perfect_fifth',
      ratio: 3 / 2,
      gain: 0.03
    },

    major_third: {
      name: 'major_third',
      ratio: 5 / 4,
      gain: 0.018
    },

    minor_third: {
      name: 'minor_third',
      ratio: 6 / 5,
      gain: 0.018
    }
  }

  return intervals[harmonicType] ?? intervals.perfect_fifth
}

// Calculates the frequencies and gains for a node's harmonic voices based on nearby nodes
export function calculateHarmonicVoices(node, nodes) {
  
  //If the node is not in harmonics mode, just return its main frequency with no harmonics
  if (!isHarmonicsNode(node)) {
    return {
      root: {
        frequency: node.frequency,
        gain: APP_CONFIG.audio.defaultGain
      },
      harmonics: []
    }
  }

   const nearbyNodes = nodes
    .filter(other => other.id !== node.id)
    .filter(other => isHarmonicsNode(other))
    .map(other => ({
      node: other,
      distance: distance(node, other)
    }))
    .filter(item => item.distance <= APP_CONFIG.harmonics.maxDistance)
    .sort((a, b) => a.distance - b.distance)

    const interval = getIntervalByType(node.harmonicType)

  const harmonics = nearbyNodes.slice(0, 3).map((item, index) => {
    //const interval = intervals[index % intervals.length]   for multiple harmonic intervals at once
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
