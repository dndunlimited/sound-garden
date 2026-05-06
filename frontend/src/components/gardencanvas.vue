<template>
   <div>
    <button @click="reset">Reset Garden</button>
    <canvas ref="canvas" width="600" height="400" style="border: 1px solid black;" @click="handleClick"></canvas>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useApi } from '../components/composables/useapi'
import { useAudio } from '../components/composables/useaudio'

const canvas = ref(null)
const { sendEvent, fetchState, resetGarden } = useApi()
const { update, ensureAudio, clearAudio } = useAudio()

let ctx
let nodes = []

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  startLoop()
})

async function handleClick(event) {
  await ensureAudio()

  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  sendEvent({ type: 'add_node', x, y })
}

async function reset() {
  await resetGarden()
  clearAudio()
  nodes = []
  draw()
}

async function startLoop() {
  while (true) {
    const state = await fetchState()
    nodes = state.nodes

    update(nodes) // 🔊 tie audio to nodes
    draw()

    await new Promise(r => setTimeout(r, 200))
  }
}

function draw() {
  ctx.clearRect(0, 0, 600, 400)
  nodes.forEach(node => {
    ctx.beginPath()
    ctx.arc(node.x, node.y, 10, 0, Math.PI * 2)
    ctx.fill()
  })
}
</script>