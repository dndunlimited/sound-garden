export function mapFrequencyToHue(freq) {
  const minFreq = 200
  const maxFreq = 1000

  const clamped = Math.max(minFreq, Math.min(maxFreq, freq))
  const normalized = (clamped - minFreq) / (maxFreq - minFreq)

  return normalized * 270
}