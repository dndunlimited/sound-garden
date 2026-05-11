<template>
  <div class="garden-wrapper">
    <button class="reset-button" @click="reset">Reset Garden</button>

    <canvas
      ref="canvas"
      class="garden-canvas"
      width="600"
      height="400"
      @click="handleClick"
    ></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import { addNode, fetchGardenState, resetGarden } from '../api/gardenApi'
import { ensureAudio, updateAudio, clearAudio } from '../audio/audioEngine'
import { renderGarden } from '../visuals/canvasRenderer'

const canvas = ref(null)

let ctx
let nodes = []

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  startLoop()
})

async function handleClick(event) {
  console.log('Canvas clicked')
  await ensureAudio()
  console.log('Audio ensured')

  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  console.log('Adding node at:', x, y)

  const result = await addNode(x, y)

  console.log('Node added:', result)

  const state = await fetchGardenState()

  console.log('State after add:', state)
  console.log('Nodes from backend:', state.nodes)

  nodes = state.nodes
  console.log('Nodes count:', nodes.length)

}

async function reset() {
  await resetGarden()
  clearAudio()
  nodes = []
  renderGarden(ctx, nodes, 600, 400)
}

async function startLoop() {
  while (true) {
    const state = await fetchGardenState()
    nodes = state.nodes
    
    console.log('Nodes from backend:', nodes)

    updateAudio(nodes)
    console.log('Audio updated')

    renderGarden(ctx, nodes, 600, 400)

    await new Promise(resolve => setTimeout(resolve, 200))
  }
} 
</script>

<style scoped>
.garden-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.garden-canvas {
  width: 600px;
  height: 400px;
  background: #071018;
  border: 2px solid #1f3d2b;
  border-radius: 12px;
  cursor: crosshair;
  display: block;
}

.reset-button {
  width: fit-content;
  padding: 8px 12px;
}
</style>