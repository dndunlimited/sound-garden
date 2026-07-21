import axios from 'axios'

const isDev = import.meta.env.DEV
const baseURL = isDev ? 'http://localhost:8000' : ''

const api = axios.create({
  baseURL
})

export async function fetchVisualAssets() {
  const res = await api.get('/api/visual-assets')

  return res.data.assets
}

export async function uploadVisualAsset(file) {
  const res = await api.post('/api/visual-assets', file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': file.name || 'Uploaded visual asset'
    }
  })

  return res.data
}

export async function removeVisualAsset(id) {
  const res = await api.delete(`/api/visual-assets/${id}`)

  return res.data.assets
}

export function getVisualAssetFileUrl(id) {
  if (!id) return ''

  return `${baseURL}/api/visual-assets/${id}/file`
}
