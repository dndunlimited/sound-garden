let ctx
let isStarted = false

export function useAudio() {
  const ensureAudio = async () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (!isStarted) {
      await ctx.resume()
      isStarted = true
    }
  }

  const activeNodes = new Map()

  const playNode = (node) => {
    if (activeNodes.has(node.id)) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.frequency.value = node.frequency
    osc.type = 'sine'

    gain.gain.value = 0.05

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()

    activeNodes.set(node.id, { osc, gain })
  }

  const update = (nodes) => {
    nodes.forEach(playNode)

    const ids = nodes.map(n => n.id)
    for (const [id, audio] of activeNodes.entries()) {
      if (!ids.includes(id)) {
        audio.osc.stop()
        activeNodes.delete(id)
      }
    }
  }

  const clearAudio = () => {
    for (const audio of activeNodes.values()) {
      audio.osc.stop()
    }
    activeNodes.clear()
  }

  return { update, ensureAudio, clearAudio }
}