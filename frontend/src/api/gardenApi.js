import axios from 'axios'

const isDev = import.meta.env.DEV
var _baseURL
if (isDev) { _baseURL = 'http://localhost:8000' } else { _baseURL = '' }

const api = axios.create({
  baseURL: _baseURL
})

export async function addNode(x, y, audioMode, harmonicType) {
  const res = await api.post('/api/event', {
    type: 'add_node',
    x,
    y,
    audioMode,
    harmonicType
  })

  return res.data
}

export async function fetchGardenState() {
  const res = await api.get('/api/garden/state')
  return res.data
}

export async function resetGarden() {
  return api.post('/api/garden/reset')
}

export async function fetchHarmonicIntervals() {
  const res = await api.get('/api/audio/harmonic-intervals')
  return res.data.intervals
}