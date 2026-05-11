import { calculateHarmonicVoices } from './harmonicEngine'
import { APP_CONFIG } from '../config/appConfig'

let ctx
let isStarted = false

const activeNodes = new Map()

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
export function updateAudio(nodes) {
  if (!ctx || !isStarted) return

  nodes.forEach(node => {
    if (!activeNodes.has(node.id)) {
      activeNodes.set(node.id, createNodeVoiceGroup(node))
    }

    const voiceGroup = activeNodes.get(node.id)
    const voices = calculateHarmonicVoices(node, nodes)

    updateVoiceGroup(voiceGroup, voices)
  })

  stopRemovedNodes(nodes)
}

// Generates a set of voices for a node, including its main frequency and any harmonic shifts
function createNodeVoiceGroup(node) {
  return {
    root: createOscillatorVoice(node.frequency, APP_CONFIG.audio.defaultGain),
    harmonics: []
  }
}

// Calculates the frequencies and gains for a node's harmonic voices based on nearby nodes
function updateVoiceGroup(group, voices) {
  group.root.osc.frequency.setTargetAtTime(
    voices.root.frequency,
    ctx.currentTime,
    0.05
  )

  group.root.gain.gain.setTargetAtTime(
    voices.root.gain,
    ctx.currentTime,
    0.05
  )

  while (group.harmonics.length < voices.harmonics.length) {
    group.harmonics.push(createOscillatorVoice(440, 0))
  }

  while (group.harmonics.length > voices.harmonics.length) {
    const voice = group.harmonics.pop()
    stopVoice(voice)
  }

  voices.harmonics.forEach((voiceData, index) => {
    const voice = group.harmonics[index]

    voice.osc.frequency.setTargetAtTime(
      voiceData.frequency,
      ctx.currentTime,
      0.05
    )

    voice.gain.gain.setTargetAtTime(
      voiceData.gain,
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
function createOscillatorVoice(frequency, gainValue) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.value = frequency
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
  for (const group of activeNodes.values()) {
    stopVoice(group.root)
    group.harmonics.forEach(stopVoice)
  }

  activeNodes.clear()
}