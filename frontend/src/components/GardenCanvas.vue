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
    <label class="sound-type-control">
      Sound Type:
      <select v-model="selectedSoundType">
        <option :value="APP_CONFIG.audio.soundTypes.PITCH">
          Pitch
        </option>
        <option :value="APP_CONFIG.audio.soundTypes.VIDEOG">
          videoG
        </option>
      </select>
    </label>
    <label class="visual-control">
      Visual:
      <select v-model="selectedVisualType">
        <option value="plant">
          Plant
        </option>
        <option value="mushroom">
          Mushroom
        </option>
      </select>
    </label>
    <label
      v-if="selectedVisualType === 'plant'"
      class="visual-control"
    >
      Plant:
      <select v-model="selectedPlantType">
        <option value="random">
          Random
        </option>
        <option
          v-for="plant in PLANT_TYPES"
          :key="plant.id"
          :value="plant.id"
        >
          {{ plant.label }}
        </option>
      </select>
    </label>
    <label
      v-if="selectedVisualType === 'mushroom'"
      class="visual-control"
    >
      Mushroom:
      <select v-model="selectedMushroomType">
        <option value="random">
          Random
        </option>
        <option
          v-for="mushroom in MUSHROOM_TYPES"
          :key="mushroom.id"
          :value="mushroom.id"
        >
          {{ mushroom.label }}
        </option>
      </select>
    </label>
    <label class="audible-limit-control">
      Max Audible:
      <input
        v-model.number="maxAudibleNodes"
        type="number"
        min="1"
        :max="APP_CONFIG.audio.maxAudibleNodesLimit"
      >
    </label>
    <label class="mute-placement-control">
      <input
        v-model="muteNewPlant"
        type="checkbox"
      >
      Muted
    </label>
    <div class="pitch-controls">
  <label v-if="selectedAudioMode === APP_CONFIG.audio.modes.NOTES">
    Note:
    <select v-model="selectedNote">
      <option
        v-for="note in pitchGrid?.notes || []"
        :key="note"
        :value="note"
      >
        {{ note }}
      </option>
    </select>
  </label>

  <label v-if="selectedAudioMode === APP_CONFIG.audio.modes.NOTES">
    Octave:
    <select v-model="selectedOctave">
      <option
        v-for="octave in pitchGrid?.octaves || []"
        :key="octave"
        :value="octave"
      >
        {{ octave }}
      </option>
    </select>
  </label>
</div>
    <canvas
       ref="canvas"
       class="garden-canvas"
       :width="APP_CONFIG.canvas.width"
       :height="APP_CONFIG.canvas.height"
       :style="canvasStyle"
       @pointerdown="handlePointerDown"
       @pointermove="handlePointerMove"
       @pointerup="handlePointerUp"
       @pointercancel="handlePointerCancel"
       @contextmenu.prevent="handleRemoveLastNode"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { APP_CONFIG } from '../config/appConfig'
import { addNode, fetchGardenState, resetGarden, fetchHarmonicIntervals, fetchPitchGrid, removeLastNode } from '../api/gardenApi'
import { ensureAudio, updateAudio, clearAudio, startPreviewVoice, updatePreviewVoice, stopPreviewVoice } from '../audio/audioEngine'
import { renderGarden } from '../visuals/canvasRenderer'
import { getPlotCoordinates, getPointInPlot } from '../visuals/plotGeometry'
import { PLANT_TYPES, RANDOM_PLANT_TYPE, getRandomPlantType } from '../visuals/plantCatalog'
import { MUSHROOM_TYPES, RANDOM_MUSHROOM_TYPE, getRandomMushroomType } from '../visuals/mushroomCatalog'

const canvas = ref(null)
const selectedAudioMode = ref(APP_CONFIG.audio.defaultMode)
const harmonicIntervals = ref([])
const selectedHarmonicType = ref('perfect_fifth')
const pitchGrid = ref(null)
const selectedNote = ref('A')
const selectedOctave = ref(4)
const selectedSoundType = ref(APP_CONFIG.audio.soundTypes.PITCH)
const selectedVisualType = ref('plant')
const selectedPlantType = ref(RANDOM_PLANT_TYPE)
const selectedMushroomType = ref(RANDOM_MUSHROOM_TYPE)
const maxAudibleNodes = ref(APP_CONFIG.audio.defaultMaxAudibleNodes)
const muteNewPlant = ref(false)

// Canvas style is defined as a reactive object to allow dynamic updates if needed
const canvasStyle = {
  width: '100%',
  maxWidth: `${APP_CONFIG.canvas.width}px`,
  aspectRatio: `${APP_CONFIG.canvas.width} / ${APP_CONFIG.canvas.height}`,
  background: APP_CONFIG.canvas.background
}

let ctx
let nodes = []
let dragState = null

const NOTE_NAMES_STANDARD = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B'
]

function getPitchSource(mode) {
  if (mode === APP_CONFIG.audio.modes.NOTES) return 'dropdown'
  if (mode === APP_CONFIG.audio.modes.TUNER) return 'tuner'

  return 'canvas'
}

function resolveVisualSelection() {
  if (selectedVisualType.value === 'mushroom') {
    return {
      visualType: 'mushroom',
      plantType: selectedMushroomType.value === RANDOM_MUSHROOM_TYPE
        ? getRandomMushroomType()
        : selectedMushroomType.value
    }
  }

  return {
    visualType: 'plant',
    plantType: selectedPlantType.value === RANDOM_PLANT_TYPE
      ? getRandomPlantType()
      : selectedPlantType.value
  }
}

function getAudiblePlantCount() {
  return nodes.filter(node => !node.isMuted).length
}

function getCanvasPoint(event) {
  const rect = canvas.value.getBoundingClientRect()

  return {
    x: (event.clientX - rect.left) * (APP_CONFIG.canvas.width / rect.width),
    y: (event.clientY - rect.top) * (APP_CONFIG.canvas.height / rect.height)
  }
}

function clampCanvasPoint(point) {
  const canvasPoint = {
    x: Math.max(0, Math.min(APP_CONFIG.canvas.width, point.x)),
    y: Math.max(0, Math.min(APP_CONFIG.canvas.height, point.y))
  }

  return getPointInPlot(canvasPoint, APP_CONFIG.canvas.width, APP_CONFIG.canvas.height)
}

function getFrequency(note, octave) {
  const noteIndex = NOTE_NAMES_STANDARD.indexOf(note)
  const midi = (Number(octave) + 1) * 12 + noteIndex

  return Math.round(440 * (2 ** ((midi - 69) / 12)) * 100) / 100
}

function getCanvasNotes() {
  return pitchGrid.value?.canvasNotes || pitchGrid.value?.notes || []
}

function getCanvasOctaves() {
  return pitchGrid.value?.canvasOctaves || pitchGrid.value?.octaves || []
}

function getCanvasNoteIndex(point) {
  const notes = getCanvasNotes()

  if (notes.length === 0) return 0

  const { u } = getPlotCoordinates(point, APP_CONFIG.canvas.width, APP_CONFIG.canvas.height)

  return Math.min(
    notes.length - 1,
    Math.max(0, Math.floor(u * notes.length))
  )
}

function getCanvasOctaveIndex(point) {
  const octaves = getCanvasOctaves()

  if (octaves.length === 0) return 0

  const { v } = getPlotCoordinates(point, APP_CONFIG.canvas.width, APP_CONFIG.canvas.height)

  return Math.min(
    octaves.length - 1,
    Math.max(0, Math.floor(v * octaves.length))
  )
}

function getCanvasPitchFromIndexes(noteIndex, octaveIndex) {
  const notes = pitchGrid.value?.canvasNotes || pitchGrid.value?.notes || []
  const octaves = pitchGrid.value?.octaves || []

  if (notes.length === 0 || octaves.length === 0) {
    return {
      note: selectedNote.value,
      octave: selectedOctave.value
    }
  }

  const note = notes[noteIndex]
  const baseOctave = Number(octaves[octaveIndex])
  const wrapsToNextOctave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
  const octave = noteIndex === notes.length - 1 || wrapsToNextOctave.includes(note)
    ? baseOctave + 1
    : baseOctave

  return { note, octave }
}

function getCanvasPitch(point) {
  return getCanvasPitchFromIndexes(
    getCanvasNoteIndex(point),
    getCanvasOctaveIndex(point)
  )
}

function getTunerFrequency(point) {
  if (!dragState) {
    const pitch = getCanvasPitch(point)
    return getFrequency(pitch.note, pitch.octave)
  }

  const notes = getCanvasNotes()
  const startCoords = getPlotCoordinates(
    { x: dragState.startX, y: dragState.startY },
    APP_CONFIG.canvas.width,
    APP_CONFIG.canvas.height
  )
  const currentCoords = getPlotCoordinates(point, APP_CONFIG.canvas.width, APP_CONFIG.canvas.height)
  const startPitch = getCanvasPitchFromIndexes(
    Math.min(notes.length - 1, Math.max(0, Math.floor(startCoords.u * notes.length))),
    getCanvasOctaveIndex(point)
  )
  const semitoneOffset = (currentCoords.u - startCoords.u) * notes.length
  const frequency = getFrequency(startPitch.note, startPitch.octave) * (2 ** (semitoneOffset / 12))

  return Math.round(frequency * 100) / 100
}

function getPreviewPitch(point, pitchSource) {
  if (pitchSource === 'tuner') {
    return {
      note: selectedNote.value,
      octave: selectedOctave.value,
      frequency: getTunerFrequency(point)
    }
  }

  if (pitchSource === 'canvas') return getCanvasPitch(point)

  return {
    note: selectedNote.value,
    octave: selectedOctave.value
  }
}

function updatePreviewFromPoint(point) {
  if (!dragState || !dragState.isAudiblePreview || dragState.isMuted) return

  const pitch = getPreviewPitch(point, dragState.pitchSource)
  updatePreviewVoice(pitch.frequency ?? getFrequency(pitch.note, pitch.octave))
}

onMounted(async () => {
  ctx = canvas.value.getContext('2d')

  harmonicIntervals.value = await fetchHarmonicIntervals()
  pitchGrid.value = await fetchPitchGrid()

  animationLoop()
})

watch(maxAudibleNodes, value => {
  const limit = APP_CONFIG.audio.maxAudibleNodesLimit
  const normalizedValue = Math.max(1, Math.min(limit, Number(value) || 1))

  if (normalizedValue !== value) {
    maxAudibleNodes.value = normalizedValue
    return
  }

  updateAudio(nodes, selectedAudioMode.value, normalizedValue)
})

async function handlePointerDown(event) {
  if (!event.isPrimary || event.button !== 0) return

  await ensureAudio()

  const point = clampCanvasPoint(getCanvasPoint(event))
  const pitchSource = getPitchSource(selectedAudioMode.value)
  const visualSelection = resolveVisualSelection()

  dragState = {
    pointerId: event.pointerId,
    pitchSource,
    plantType: visualSelection.plantType,
    visualType: visualSelection.visualType,
    soundType: selectedSoundType.value,
    isMuted: muteNewPlant.value,
    isAudiblePreview: getAudiblePlantCount() < maxAudibleNodes.value,
    startX: point.x,
    startY: point.y,
    x: point.x,
    y: point.y
  }

  const pitch = getPreviewPitch(point, pitchSource)

  canvas.value.setPointerCapture(event.pointerId)
  if (dragState.isAudiblePreview && !dragState.isMuted) {
    startPreviewVoice(
      pitch.frequency ?? getFrequency(pitch.note, pitch.octave),
      dragState.soundType
    )
  }
}

function handlePointerMove(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return

  const point = clampCanvasPoint(getCanvasPoint(event))

  dragState.x = point.x
  dragState.y = point.y
  updatePreviewFromPoint(point)
}

async function handlePointerUp(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return

  const point = clampCanvasPoint(getCanvasPoint(event))
  const pitchSource = dragState.pitchSource

  dragState.x = point.x
  dragState.y = point.y
  updatePreviewFromPoint(point)
  if (canvas.value.hasPointerCapture(event.pointerId)) {
    canvas.value.releasePointerCapture(event.pointerId)
  }

  try {
    await addNode(
      dragState.x,
      dragState.y,
      selectedAudioMode.value,
      selectedHarmonicType.value,
      selectedNote.value,
      selectedOctave.value,
      pitchSource,
      dragState.startX,
      dragState.startY,
      dragState.plantType,
      dragState.visualType,
      dragState.isMuted,
      dragState.soundType
    )
  } finally {
    stopPreviewVoice()
    dragState = null
  }

  const state = await fetchGardenState()

  //console.log('State after add:', state)
  //console.log('Nodes from backend:', state.nodes)

  nodes = state.nodes
 //console.log('Nodes count:', nodes.length)
  updateAudio(nodes, selectedAudioMode.value, maxAudibleNodes.value)

}

function handlePointerCancel(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return

  if (canvas.value.hasPointerCapture(event.pointerId)) {
    canvas.value.releasePointerCapture(event.pointerId)
  }

  stopPreviewVoice()
  dragState = null
}

async function handleRemoveLastNode() {
  if (dragState) {
    stopPreviewVoice()
    dragState = null
  }

  await removeLastNode()
  const state = await fetchGardenState()

  nodes = state.nodes
  updateAudio(nodes, selectedAudioMode.value, maxAudibleNodes.value)
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
  const previewPitch = dragState
    ? getPreviewPitch({ x: dragState.x, y: dragState.y }, dragState.pitchSource)
    : null
  const previewNode = dragState && previewPitch
    ? [{
      id: -1,
      x: dragState.x,
      y: dragState.y,
      frequency: previewPitch.frequency ?? getFrequency(previewPitch.note, previewPitch.octave),
      soundType: dragState.soundType,
      plantType: dragState.plantType,
      visualType: dragState.visualType,
      isMuted: dragState.isMuted
    }]
    : []

  renderGarden(
    ctx,
    nodes.concat(previewNode),
    APP_CONFIG.canvas.width,
    APP_CONFIG.canvas.height,
    selectedAudioMode.value,
    pitchGrid.value
  )

  requestAnimationFrame(animationLoop)
}
async function startLoop() {
  while (true) {
    const state = await fetchGardenState()
    nodes = state.nodes
    
    console.log('Nodes from backend:', nodes)

    updateAudio(nodes, selectedAudioMode.value, maxAudibleNodes.value)
    console.log('Audio updated')

    renderGarden(ctx, nodes, APP_CONFIG.canvas.width, APP_CONFIG.canvas.height)

    await new Promise(resolve => setTimeout(resolve, 200))
  }
} 
</script>

<!--  CSS FOR CANVAS AND CONTROLS -->
<style scoped>
.pitch-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  color: rgb(0, 0, 0);
  margin-bottom: 8px;
  background: white;
}

.pitch-controls label {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pitch-controls select {
  padding: 4px 8px;
}
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
  touch-action: none;
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

.sound-type-control {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgb(0, 0, 0);
}

.sound-type-control select {
  padding: 4px 8px;
}

.visual-control {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgb(0, 0, 0);
}

.visual-control select {
  padding: 4px 8px;
}

.audible-limit-control {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgb(0, 0, 0);
}

.audible-limit-control input {
  width: 56px;
  padding: 4px 8px;
}

.mute-placement-control {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgb(0, 0, 0);
}

</style>
