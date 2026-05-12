import { APP_CONFIG } from '../config/appConfig'
import { calculateHarmonicVoices } from './Modes/harmonicEngine'
import { calculateTunerVoices } from './Modes/tunerEngine'

export function calculateVoices(node, nodes, mode) {
  console.log('Audio mode:', mode)

  switch (mode) {
    case APP_CONFIG.audio.modes.TUNER:
      return calculateTunerVoices(node, nodes)

    case APP_CONFIG.audio.modes.HARMONICS:
    default:
      return calculateHarmonicVoices(node, nodes)
  }
}