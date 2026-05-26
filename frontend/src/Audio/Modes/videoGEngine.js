import { APP_CONFIG } from '../../config/appConfig'

export function calculateVideoGVoices(node) {
  const frequency = node.frequency

  return {
    root: {
      frequency,
      gain: APP_CONFIG.audio.defaultGain * 0.42,
      type: 'sawtooth',
      detune: -4
    },
    harmonics: [
      {
        frequency,
        gain: APP_CONFIG.audio.defaultGain * 0.34,
        type: 'triangle',
        detune: 5
      },
      {
        frequency: frequency * 0.5,
        gain: APP_CONFIG.audio.defaultGain * 0.18,
        type: 'sine',
        detune: -2
      },
      {
        frequency: frequency * 1.5,
        gain: APP_CONFIG.audio.defaultGain * 0.16,
        type: 'triangle',
        detune: 3
      },
      {
        frequency: frequency * 2,
        gain: APP_CONFIG.audio.defaultGain * 0.11,
        type: 'sine',
        detune: -3
      },
      {
        frequency: frequency * 2.98,
        gain: APP_CONFIG.audio.defaultGain * 0.07,
        type: 'triangle',
        detune: 7
      },
      {
        frequency: frequency * 4.02,
        gain: APP_CONFIG.audio.defaultGain * 0.045,
        type: 'sine',
        detune: -6
      }
    ]
  }
}
