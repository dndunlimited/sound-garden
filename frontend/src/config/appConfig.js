export const APP_CONFIG = {
  canvas: {
    width: 900,
    height: 600,
    background: '#23285c',
    gridDisplays: {
      BACKGROUND: 'background',
      ORIGINAL: 'original',
      HIDDEN: 'hidden'
    },
    defaultGridDisplay: 'background'
  },

  audio: {
    defaultGain: 0.05,
    defaultMaxAudibleNodes: 10,
    maxAudibleNodesLimit: 20,
    minMixGainScale: 0.18,
    mixGainExponent: 0.65,
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

    soundTypes: {
      PITCH: 'pitch',
      VIDEOG: 'videoG',
      SAMPLE: 'sample'
    },

    soundTypeLabels: {
      pitch: 'Pitch',
      videoG: 'videoG',
      sample: 'Uploaded'
    },

    defaultMode: 'noise'
  },

  harmonics: {
    maxDistance: 200
  },

  tuner: {
    maxShift: 20
  }
}
