import { APP_CONFIG } from '../config/appConfig'
import { calculateHarmonicVoices } from './Modes/harmonicEngine'
import { calculateVideoGVoices } from './Modes/videoGEngine'
import { calculateTunerVoices } from './Modes/tunerEngine'

export function calculateVoices(node, nodes, mode) {
  const resolvedMode = node.audioMode ?? mode
  const resolvedSoundType = node.soundType ?? APP_CONFIG.audio.soundTypes.PITCH

  if (
    resolvedSoundType === APP_CONFIG.audio.soundTypes.VIDEOG
  ) {
    return calculateVideoGVoices(node)
  }

  switch (resolvedMode) {
    case APP_CONFIG.audio.modes.TUNER:
      return calculateTunerVoices(node, nodes)

    case APP_CONFIG.audio.modes.HARMONICS:
      return calculateHarmonicVoices(node, nodes)

    case APP_CONFIG.audio.modes.NOTES:
    case APP_CONFIG.audio.modes.NOISE:
    default:
      return {
        root: {
          frequency: node.frequency,
          gain: APP_CONFIG.audio.defaultGain
        },
        harmonics: []
      }
  }
}
