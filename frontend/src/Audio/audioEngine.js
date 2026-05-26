import { calculateVoices } from './audioModeEngine'
import { APP_CONFIG } from '../config/appConfig'

let ctx
let isStarted = false

const activeNodes = new Map()
let previewVoice = null

//Verifies audio context is initialized and resumed on user interaction
export async function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }

  if (!isStarted) {
    await ctx.resume()
    isStarted = true
  }
}

//updates audio voices for all nodes based on their current state and proximity to others
export function updateAudio(nodes, mode, maxAudibleNodes = APP_CONFIG.audio.defaultMaxAudibleNodes) {
  if (!ctx || !isStarted) return

  // Audible plants are the oldest unmuted plants up to the current limit.
  // Muted plants never count toward the limit, gain scaling, or harmonics.
  const audibleNodes = nodes
    .filter(node => !node.isMuted)
    .slice(0, maxAudibleNodes)
  const gainScale = getMixGainScale(audibleNodes.length)

  audibleNodes.forEach(node => {
    if (!activeNodes.has(node.id)) {
      activeNodes.set(node.id, createNodeVoiceGroup(node))
    }

    const voiceGroup = activeNodes.get(node.id)
    const voices = calculateVoices(node, audibleNodes, node.audioMode ?? mode)

    updateVoiceGroup(voiceGroup, voices, gainScale)
  })

  stopRemovedNodes(audibleNodes)
}

function getMixGainScale(nodeCount) {
  if (nodeCount <= 1) return 1

  const scale = 1 / (nodeCount ** APP_CONFIG.audio.mixGainExponent)

  return Math.max(APP_CONFIG.audio.minMixGainScale, scale)
}

export function startPreviewVoice(frequency, soundType = APP_CONFIG.audio.soundTypes.PITCH) {
  if (!ctx || !isStarted) return

  stopPreviewVoice()
  previewVoice = createPreviewVoiceGroup(frequency, soundType)
}

export function updatePreviewVoice(frequency) {
  if (!ctx || !isStarted || !previewVoice) return

  const previewVoices = getPreviewVoices(frequency, previewVoice.soundType)

  updateVoiceGroup(previewVoice, previewVoices)
}

export function stopPreviewVoice() {
  if (!previewVoice) return

  stopVoice(previewVoice.root)
  previewVoice.harmonics.forEach(stopVoice)
  previewVoice = null
}

function createPreviewVoiceGroup(frequency, soundType) {
  const voices = getPreviewVoices(frequency, soundType)
  const group = {
    soundType,
    root: createOscillatorVoice(
      voices.root.frequency,
      voices.root.gain,
      voices.root.type ?? 'sine',
      voices.root.detune ?? 0
    ),
    harmonics: []
  }

  voices.harmonics.forEach(voice => {
    group.harmonics.push(createOscillatorVoice(
      voice.frequency,
      voice.gain,
      voice.type ?? 'sine',
      voice.detune ?? 0
    ))
  })

  return group
}

function getPreviewVoices(frequency, soundType) {
  if (soundType === APP_CONFIG.audio.soundTypes.VIDEOG) {
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

  return {
    root: {
      frequency,
      gain: APP_CONFIG.audio.defaultGain,
      type: 'sine'
    },
    harmonics: []
  }
}

// Generates a set of voices for a node, including its main frequency and any harmonic shifts
function createNodeVoiceGroup(node) {
  return {
    root: createOscillatorVoice(node.frequency, APP_CONFIG.audio.defaultGain),
    harmonics: []
  }
}

// Calculates the frequencies and gains for a node's harmonic voices based on nearby nodes
function updateVoiceGroup(group, voices, gainScale = 1) {
  // Update the root voice
  group.root.osc.type = voices.root.type ?? 'sine'
  group.root.osc.detune.setTargetAtTime(
    voices.root.detune ?? 0,
    ctx.currentTime,
    0.05
  )

  group.root.osc.frequency.setTargetAtTime(
    voices.root.frequency,
    ctx.currentTime,
    0.05
  )

  group.root.gain.gain.setTargetAtTime(
    voices.root.gain * gainScale,
    ctx.currentTime,
    0.05
  )

  // If this specific node should have no harmonics, stop only this node's harmonic voices.
  if (voices.harmonics.length === 0) {
    while (group.harmonics.length > 0) {
      const voice = group.harmonics.pop()
      stopVoice(voice)
    }

    return
  }

  // Add harmonic voices if this node needs more.
  while (group.harmonics.length < voices.harmonics.length) {
    group.harmonics.push(createOscillatorVoice(440, 0))
  }

  // Remove extra harmonic voices if this node needs fewer.
  while (group.harmonics.length > voices.harmonics.length) {
    const voice = group.harmonics.pop()
    stopVoice(voice)
  }

  // Update this node's harmonic voices.
  voices.harmonics.forEach((voiceData, index) => {
    const voice = group.harmonics[index]
    voice.osc.type = voiceData.type ?? 'sine'
    voice.osc.detune.setTargetAtTime(
      voiceData.detune ?? 0,
      ctx.currentTime,
      0.05
    )

    voice.osc.frequency.setTargetAtTime(
      voiceData.frequency,
      ctx.currentTime,
      0.05
    )

    voice.gain.gain.setTargetAtTime(
      voiceData.gain * gainScale,
      ctx.currentTime,
      0.05
    )
  })
}

// Creates a single oscillator voice with the specified frequency and gain
function createVoice(node) {

  console.log('Creating audio voice for node:', node)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.value = node.frequency
  gain.gain.value = 0.05

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()

  activeNodes.set(node.id, { osc, gain })
}

// Calculates the harmonic frequencies and gains for a node based on its proximity to other nodes
function createOscillatorVoice(frequency, gainValue, type = 'sine', detune = 0) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = frequency
  osc.detune.value = detune
  gain.gain.value = gainValue

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()

  return { osc, gain }
}

//Stops an oscillator voice with a quick fade-out to avoid clicks
function stopVoice(voice) {
  voice.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03)
  setTimeout(() => {
    voice.osc.stop()
  }, 80)
}

// Stops voices for nodes that have been removed from the garden
function stopRemovedNodes(nodes) {
  const ids = nodes.map(node => node.id)

  for (const [id, group] of activeNodes.entries()) {
    if (!ids.includes(id)) {
      stopVoice(group.root)

      group.harmonics.forEach(stopVoice)

      activeNodes.delete(id)
    }
  }
}

//Resets all audio by stopping all active voices and clearing the state
export function clearAudio() {
  stopPreviewVoice()

  for (const group of activeNodes.values()) {
    stopVoice(group.root)
    group.harmonics.forEach(stopVoice)
  }

  activeNodes.clear()
}
