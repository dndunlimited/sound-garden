import { calculateHarmonicFrequency } from './harmonicEngine'

let ctx
let isStarted = false
const activeNodes = new Map()

export async function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }

  if (!isStarted) {
    await ctx.resume()
    isStarted = true
  }
}

export function updateAudio(nodes) {
  if (!ctx) {
    console.warn('Audio context not initialized yet')
    return
  }
  nodes.forEach(node => {
    if (!activeNodes.has(node.id)) {
      createVoice(node)
    }

    const audio = activeNodes.get(node.id)
    const targetFrequency = calculateHarmonicFrequency(node, nodes)

    audio.osc.frequency.setTargetAtTime(
      targetFrequency,
      ctx.currentTime,
      0.05
    )
  })

  stopRemovedNodes(nodes)
}

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

function stopRemovedNodes(nodes) {
  const ids = nodes.map(n => n.id)

  for (const [id, audio] of activeNodes.entries()) {
    if (!ids.includes(id)) {
      audio.osc.stop()
      activeNodes.delete(id)
    }
  }
}

export function clearAudio() {
  for (const audio of activeNodes.values()) {
    audio.osc.stop()
  }

  activeNodes.clear()
}