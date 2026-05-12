import { APP_CONFIG } from '../../config/appConfig'

export function calculateTunerVoices(node) {
  const baseFrequency = node.rawFrequency ?? node.frequency

  return {
    root: {
      frequency: baseFrequency,
      gain: APP_CONFIG.audio.defaultGain
    },
    harmonics: []
  }
}