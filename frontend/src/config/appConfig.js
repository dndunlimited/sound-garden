export const APP_CONFIG = {
  canvas: {
    width: 600,
    height: 400,
    background: '#23285c'
  },

  audio: {
    defaultGain: 0.05,
    maxNodes: 20,

    modes: {
      HARMONICS: 'harmonics',
      TUNER: 'tuner',
      NOTES: 'notes',
      NOISE: 'noise'
    },

    modeLabels: {
      harmonics: 'Harmonics',
      tuner: 'Tuner',
      notes: 'Notes',
      noise: 'Noise'
    },

    defaultMode: 'harmonics'
  },

  harmonics: {
    maxDistance: 200
  },

  tuner: {
    maxShift: 20
  }
}