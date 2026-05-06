import axios from 'axios'

const api = axios.create({
  baseURL: "http://localhost:8000"
})

export function useApi() {
  const sendEvent = async (event) => {
    await api.post('/event', event)
  }

  const fetchState = async () => {
    const res = await api.get('/state')
    return res.data
  }

  const resetGarden = async () => {
    await api.post('/reset')
  }

  return { sendEvent, fetchState, resetGarden }
}