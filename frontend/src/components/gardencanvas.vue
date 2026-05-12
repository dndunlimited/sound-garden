<template>
  <div class="garden-wrapper">
    <button class="reset-button" @click="reset">Reset Garden</button>
    <label
  v-if="selectedAudioMode === APP_CONFIG.audio.modes.HARMONICS"
  class="sound-mode-control"
>
  Harmonic Type:
  <select v-model="selectedHarmonicType">
    <option
      v-for="interval in harmonicIntervals"
      :key="interval.id"
      :value="interval.id"
    >
      {{ interval.label }}
    </option>
  </select>
</label>
    <label>
      Sound Mode:
      <select v-model="selectedAudioMode">
        <option :value="APP_CONFIG.audio.modes.HARMONICS">
          Harmonics
        </option>
        <option :value="APP_CONFIG.audio.modes.TUNER">
          Tuner
        </option>
        <option :value="APP_CONFIG.audio.modes.NOTES">
          Notes
        </option>
        <option :value="APP_CONFIG.audio.modes.NOISE">
          Noise
        </option>
      </select>
    </label>
    <canvas
       ref="canvas"
       class="garden-canvas"
       :width="APP_CONFIG.canvas.width"
       :height="APP_CONFIG.canvas.height"
       :style="canvasStyle"
       @click="handleClick"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch} from 'vue'
import { APP_CONFIG } from '../config/appConfig'
import { addNode, fetchGardenState, resetGarden, fetchHarmonicIntervals } from '../api/gardenApi'
import { ensureAudio, updateAudio, clearAudio } from '../audio/audioEngine'
import { renderGarden } from '../visuals/canvasRenderer'

const canvas = ref(null)
const selectedAudioMode = ref(APP_CONFIG.audio.defaultMode)
const harmonicIntervals = ref([])
const selectedHarmonicType = ref('perfect_fifth')

// Canvas style is defined as a reactive object to allow dynamic updates if needed
const canvasStyle = {
  width: '100%',
  maxWidth: `${APP_CONFIG.canvas.width}px`,
  aspectRatio: `${APP_CONFIG.canvas.width} / ${APP_CONFIG.canvas.height}`,
  background: APP_CONFIG.canvas.background
}

let ctx
let nodes = []

onMounted(async () => {
  ctx = canvas.value.getContext('2d')

  harmonicIntervals.value = await fetchHarmonicIntervals()

  animationLoop()
})

async function handleClick(event) {
 //console.log('Canvas clicked')
  await ensureAudio()
 //console.log('Audio ensured')

  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

 //console.log('Adding node at:', x, y)

  const result = await addNode(x, y, selectedAudioMode.value, selectedHarmonicType.value)

  //console.log('Node added:', result)

  const state = await fetchGardenState()

  //console.log('State after add:', state)
  //console.log('Nodes from backend:', state.nodes)

  nodes = state.nodes
 //console.log('Nodes count:', nodes.length)
  updateAudio(nodes, selectedAudioMode.value)

}

async function reset() {
  await resetGarden()
  clearAudio()
  nodes = []
  renderGarden(
    ctx,
    nodes,
    APP_CONFIG.canvas.width,
    APP_CONFIG.canvas.height,
    selectedAudioMode.value
  )
}

// The animation loop continuously renders the garden state on the canvas
function animationLoop() {
  renderGarden(
    ctx,
    nodes,
    APP_CONFIG.canvas.width,
    APP_CONFIG.canvas.height,
    selectedAudioMode.value
  )

  requestAnimationFrame(animationLoop)
}
async function startLoop() {
  while (true) {
    const state = await fetchGardenState()
    nodes = state.nodes
    
    console.log('Nodes from backend:', nodes)

    updateAudio(nodes, selectedAudioMode.value)
    console.log('Audio updated')

    renderGarden(ctx, nodes, 600, 400)

    await new Promise(resolve => setTimeout(resolve, 200))
  }
} 
</script>

<!--  CSS FOR CANVAS AND CONTROLS -->
<style scoped>
.garden-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.garden-canvas {
  border: 2px solid #185f42;
  border-radius: 15px;
  cursor: pointer;
  display: block;
}

.reset-button {
  width: fit-content;
  padding: 8px 12px;
}

.sound-mode-control {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgb(94, 71, 146);
  margin-bottom: 8px;
}

.sound-mode-control select {
  padding: 4px 8px;
}
</style>