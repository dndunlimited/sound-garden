<template>
  <div class="garden-wrapper">
    <div class="top-actions">
      <button class="reset-button" @click="reset">Reset Garden</button>
      <button class="close-button" @click="closeApplication">Close Application</button>
    </div>
    <div class="canvas-controls">
        <label
          v-if="selectedAudioMode === APP_CONFIG.audio.modes.HARMONICS"
          class="control-field"
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
        <label class="control-field">
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
        <label class="control-field">
          Grid:
          <select v-model="selectedGridDisplay">
            <option :value="APP_CONFIG.canvas.gridDisplays.BACKGROUND">
              Fantasy Overlay
            </option>
            <option :value="APP_CONFIG.canvas.gridDisplays.ORIGINAL">
              Garden Overlay
            </option>
            <option :value="APP_CONFIG.canvas.gridDisplays.HIDDEN">
              Hide Overlay
            </option>
          </select>
        </label>
        <label class="control-field">
          Sound Type:
          <select v-model="selectedSoundType">
            <option :value="APP_CONFIG.audio.soundTypes.PITCH">
              Pitch
            </option>
            <option :value="APP_CONFIG.audio.soundTypes.VIDEOG">
              videoG
            </option>
            <option :value="APP_CONFIG.audio.soundTypes.SAMPLE">
              Uploaded
            </option>
          </select>
        </label>
        <label class="control-field sound-upload-control">
          Upload:
          <input
            type="file"
            accept="audio/*"
            @change="handleSoundUpload"
          >
        </label>
        <label
          v-if="selectedSoundType === APP_CONFIG.audio.soundTypes.SAMPLE"
          class="control-field"
        >
          Saved Sound:
          <select v-model="selectedSampleId">
            <option value="">
              None
            </option>
            <option
              v-for="sound in savedSounds"
              :key="sound.id"
              :value="sound.id"
            >
              {{ sound.name }}
            </option>
          </select>
        </label>
        <label
          v-if="selectedSoundType === APP_CONFIG.audio.soundTypes.SAMPLE"
          class="control-field"
        >
          Playback:
          <select v-model="selectedSamplePlaybackMode">
            <option value="pitched">
              Pitch Tracked
            </option>
            <option value="raw">
              Raw File
            </option>
          </select>
        </label>
        <button
          v-if="selectedSoundType === APP_CONFIG.audio.soundTypes.SAMPLE && selectedSampleId"
          class="remove-sound-button"
          type="button"
          @click="handleRemoveSavedSound"
        >
          Remove Sound
        </button>
        <label class="control-field">
          Visual:
          <select v-model="selectedVisualType">
            <option value="plant">
              Plant
            </option>
            <option value="mushroom">
              Mushroom
            </option>
            <option value="asset">
              Uploaded Asset
            </option>
          </select>
        </label>
        <label class="control-field visual-option-control">
          <input
            v-model="isGlowEnabled"
            type="checkbox"
          >
          Glow
        </label>
        <label class="control-field visual-option-control">
          <input
            v-model="isMotionEnabled"
            type="checkbox"
          >
          Motion
        </label>
        <label
          v-if="selectedVisualType === 'asset'"
          class="control-field asset-upload-control"
        >
          Visual Upload:
          <input
            type="file"
            accept="image/*"
            @change="handleVisualAssetUpload"
          >
        </label>
        <label
          v-if="selectedVisualType === 'asset'"
          class="control-field"
        >
          Asset:
          <select v-model="selectedVisualAssetId">
            <option value="">
              None
            </option>
            <option
              v-for="asset in visualAssets"
              :key="asset.id"
              :value="asset.id"
            >
              {{ asset.name }}
            </option>
          </select>
        </label>
        <button
          v-if="selectedVisualType === 'asset' && selectedVisualAssetId"
          class="remove-sound-button"
          type="button"
          @click="handleRemoveVisualAsset"
        >
          Remove Asset
        </button>
        <label
          v-if="selectedVisualType === 'plant'"
          class="control-field"
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
          class="control-field"
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
        <label class="control-field audible-limit-control">
          Max Audible:
          <input
            v-model.number="maxAudibleNodes"
            type="number"
            min="1"
            :max="APP_CONFIG.audio.maxAudibleNodesLimit"
          >
        </label>
        <label class="control-field mute-placement-control">
          <input
            v-model="muteNewPlant"
            type="checkbox"
          >
          Muted
        </label>
        <label
          v-if="selectedAudioMode === APP_CONFIG.audio.modes.NOTES"
          class="control-field"
        >
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
        <label
          v-if="selectedAudioMode === APP_CONFIG.audio.modes.NOTES"
          class="control-field"
        >
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
    <div
      class="canvas-stage"
      :style="canvasStyle"
    >
      <canvas
        ref="canvas"
        class="garden-canvas"
        :width="APP_CONFIG.canvas.width"
        :height="APP_CONFIG.canvas.height"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
        @contextmenu.prevent="handleRemoveLastNode"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { APP_CONFIG } from '../config/appConfig'
import { addNode, closeApp, fetchGardenState, resetGarden, fetchHarmonicIntervals, fetchPitchGrid, removeLastNode } from '../api/gardenApi'
import { ensureAudio, updateAudio, clearAudio, startPreviewVoice, updatePreviewVoice, stopPreviewVoice } from '../audio/audioEngine'
import { renderGarden } from '../visuals/canvasRenderer'
import { getPlotCoordinates, getPointInPlot } from '../visuals/plotGeometry'
import { PLANT_TYPES, RANDOM_PLANT_TYPE, getRandomPlantType } from '../visuals/plantCatalog'
import { MUSHROOM_TYPES, RANDOM_MUSHROOM_TYPE, getRandomMushroomType } from '../visuals/mushroomCatalog'
import { loadSavedSounds, removeSavedSound, saveUploadedSound } from '../audio/soundLibrary'
import { fetchVisualAssets, removeVisualAsset, uploadVisualAsset } from '../api/visualAssetApi'
import fantasyBackgroundUrl from '../assets/FantasyGardenNoGrid.png'

const canvas = ref(null)
const selectedAudioMode = ref(APP_CONFIG.audio.defaultMode)
const selectedGridDisplay = ref(APP_CONFIG.canvas.defaultGridDisplay)
const harmonicIntervals = ref([])
const selectedHarmonicType = ref('perfect_fifth')
const pitchGrid = ref(null)
const selectedNote = ref('A')
const selectedOctave = ref(4)
const selectedSoundType = ref(APP_CONFIG.audio.soundTypes.PITCH)
const savedSounds = ref([])
const selectedSampleId = ref('')
const selectedSamplePlaybackMode = ref('pitched')
const selectedVisualType = ref('plant')
const isGlowEnabled = ref(true)
const isMotionEnabled = ref(true)
const visualAssets = ref([])
const selectedVisualAssetId = ref('')
const selectedPlantType = ref(RANDOM_PLANT_TYPE)
const selectedMushroomType = ref(RANDOM_MUSHROOM_TYPE)
const maxAudibleNodes = ref(APP_CONFIG.audio.defaultMaxAudibleNodes)
const muteNewPlant = ref(false)

// Canvas style is defined as a reactive object to allow dynamic updates if needed
const canvasStyle = {
  width: '100%',
  maxWidth: `${APP_CONFIG.canvas.width}px`,
  aspectRatio: `${APP_CONFIG.canvas.width} / ${APP_CONFIG.canvas.height}`,
  background: `${APP_CONFIG.canvas.background} url("${fantasyBackgroundUrl}") center / cover no-repeat`
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
  if (selectedVisualType.value === 'asset') {
    return {
      visualType: 'asset',
      plantType: null,
      visualAssetId: selectedVisualAssetId.value || null
    }
  }

  if (selectedVisualType.value === 'mushroom') {
    return {
      visualType: 'mushroom',
      plantType: selectedMushroomType.value === RANDOM_MUSHROOM_TYPE
        ? getRandomMushroomType()
        : selectedMushroomType.value,
      visualAssetId: null
    }
  }

  return {
    visualType: 'plant',
    plantType: selectedPlantType.value === RANDOM_PLANT_TYPE
      ? getRandomPlantType()
      : selectedPlantType.value,
    visualAssetId: null
  }
}

function getAudiblePlantCount() {
  return nodes.filter(node => !node.isMuted).length
}

async function handleSoundUpload(event) {
  const file = event.target.files?.[0]

  if (!file) return

  try {
    const sound = await saveUploadedSound(file)

    savedSounds.value = await loadSavedSounds()
    selectedSampleId.value = sound.id
    selectedSoundType.value = APP_CONFIG.audio.soundTypes.SAMPLE
  } catch (error) {
    console.warn('Unable to save uploaded sound:', error)
  } finally {
    event.target.value = ''
  }
}

async function handleRemoveSavedSound() {
  if (!selectedSampleId.value) return

  savedSounds.value = await removeSavedSound(selectedSampleId.value)
  selectedSampleId.value = savedSounds.value[0]?.id || ''
}

async function handleVisualAssetUpload(event) {
  const file = event.target.files?.[0]

  if (!file) return

  try {
    const asset = await uploadVisualAsset(file)

    visualAssets.value = await fetchVisualAssets()
    selectedVisualAssetId.value = asset.id
    selectedVisualType.value = 'asset'
  } catch (error) {
    console.warn('Unable to save visual asset:', error)
  } finally {
    event.target.value = ''
  }
}

async function handleRemoveVisualAsset() {
  if (!selectedVisualAssetId.value) return

  visualAssets.value = await removeVisualAsset(selectedVisualAssetId.value)
  selectedVisualAssetId.value = visualAssets.value[0]?.id || ''
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

  savedSounds.value = await loadSavedSounds()
  selectedSampleId.value = savedSounds.value[0]?.id || ''
  visualAssets.value = await fetchVisualAssets()
  selectedVisualAssetId.value = visualAssets.value[0]?.id || ''
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

  if (
    selectedSoundType.value === APP_CONFIG.audio.soundTypes.SAMPLE &&
    !selectedSampleId.value
  ) {
    return
  }

  if (selectedVisualType.value === 'asset' && !selectedVisualAssetId.value) {
    return
  }

  await ensureAudio()

  const point = clampCanvasPoint(getCanvasPoint(event))
  const pitchSource = getPitchSource(selectedAudioMode.value)
  const visualSelection = resolveVisualSelection()

  dragState = {
    pointerId: event.pointerId,
    pitchSource,
    plantType: visualSelection.plantType,
    visualType: visualSelection.visualType,
    visualAssetId: visualSelection.visualAssetId,
    isGlowEnabled: isGlowEnabled.value,
    isMotionEnabled: isMotionEnabled.value,
    soundType: selectedSoundType.value,
    sampleId: selectedSoundType.value === APP_CONFIG.audio.soundTypes.SAMPLE
      ? selectedSampleId.value
      : null,
    samplePlaybackMode: selectedSoundType.value === APP_CONFIG.audio.soundTypes.SAMPLE
      ? selectedSamplePlaybackMode.value
      : 'pitched',
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
      dragState.soundType,
      dragState.sampleId,
      dragState.samplePlaybackMode
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
      dragState.visualAssetId,
      dragState.isMuted,
      dragState.soundType,
      dragState.sampleId,
      dragState.samplePlaybackMode,
      dragState.isGlowEnabled,
      dragState.isMotionEnabled
    )
  } finally {
    stopPreviewVoice()
    dragState = null
  }

  const state = await fetchGardenState()

  nodes = state.nodes
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
    selectedAudioMode.value,
    pitchGrid.value,
    selectedGridDisplay.value
  )
}

async function closeApplication() {
  clearAudio()
  await closeApp()
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
      sampleId: dragState.sampleId,
      samplePlaybackMode: dragState.samplePlaybackMode,
      plantType: dragState.plantType,
      visualType: dragState.visualType,
      visualAssetId: dragState.visualAssetId,
      isGlowEnabled: dragState.isGlowEnabled,
      isMotionEnabled: dragState.isMotionEnabled,
      isMuted: dragState.isMuted
    }]
    : []

  renderGarden(
    ctx,
    nodes.concat(previewNode),
    APP_CONFIG.canvas.width,
    APP_CONFIG.canvas.height,
    selectedAudioMode.value,
    pitchGrid.value,
    selectedGridDisplay.value
  )

  requestAnimationFrame(animationLoop)
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

.top-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.canvas-stage {
  position: relative;
  overflow: hidden;
  border: 2px solid #185f42;
  border-radius: 15px;
  display: block;
}

.garden-canvas {
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: block;
  touch-action: none;
}

.reset-button {
  width: fit-content;
  padding: 8px 12px;
}

.close-button {
  width: fit-content;
  padding: 8px 12px;
  border: 1px solid rgba(92, 38, 38, 0.42);
  border-radius: 4px;
  background: rgba(255, 242, 242, 0.94);
  color: rgb(78, 30, 30);
  cursor: pointer;
}

.canvas-controls {
  display: flex;
  gap: 8px;
  row-gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  width: min(900px, 100%);
  padding: 10px 12px;
  border: 1px solid rgba(28, 73, 48, 0.2);
  border-radius: 8px;
  background: rgba(246, 251, 241, 0.94);
  box-shadow: 0 8px 18px rgba(18, 55, 35, 0.14);
}

.control-field {
  display: flex;
  gap: 6px;
  align-items: center;
  color: rgb(21, 44, 31);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.control-field select,
.control-field input[type='number'] {
  padding: 4px 8px;
  border: 1px solid rgba(28, 73, 48, 0.34);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.84);
  color: rgb(20, 38, 28);
  font: inherit;
}

.control-field select {
  max-width: 132px;
}

.sound-upload-control input,
.asset-upload-control input {
  max-width: 150px;
  font-size: 12px;
}

.remove-sound-button {
  padding: 4px 8px;
  border: 1px solid rgba(92, 38, 38, 0.34);
  border-radius: 4px;
  background: rgba(255, 244, 244, 0.86);
  color: rgb(78, 30, 30);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
}

.audible-limit-control input {
  width: 56px;
}

.mute-placement-control {
  padding-left: 2px;
}

.mute-placement-control input {
  margin: 0;
}

</style>
