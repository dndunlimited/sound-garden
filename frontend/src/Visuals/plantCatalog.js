export const RANDOM_PLANT_TYPE = 'random'

export const PLANT_TYPES = [
  { id: 'glow_bloom', label: 'Glow Bloom', bloom: 'round', petals: 7, leafCount: 2, scale: 1 },
  { id: 'sun_crown', label: 'Sun Crown', bloom: 'sun', petals: 12, leafCount: 2, scale: 1.08 },
  { id: 'bell_flower', label: 'Bell Flower', bloom: 'bell', petals: 5, leafCount: 3, scale: 0.96 },
  { id: 'twin_leaf', label: 'Twin Leaf', bloom: 'round', petals: 4, leafCount: 4, scale: 0.92 },
  { id: 'star_petal', label: 'Star Petal', bloom: 'star', petals: 8, leafCount: 2, scale: 1 },
  { id: 'wild_sprout', label: 'Wild Sprout', bloom: 'sprout', petals: 3, leafCount: 5, scale: 0.86 },
  { id: 'tall_lily', label: 'Tall Lily', bloom: 'lily', petals: 6, leafCount: 3, scale: 1.12 },
  { id: 'clover_note', label: 'Clover Note', bloom: 'clover', petals: 4, leafCount: 3, scale: 0.94 },
  { id: 'fern_song', label: 'Fern Song', bloom: 'fern', petals: 0, leafCount: 8, scale: 1 },
  { id: 'orchid_pulse', label: 'Orchid Pulse', bloom: 'orchid', petals: 5, leafCount: 2, scale: 1.04 },
  { id: 'reed_light', label: 'Reed Light', bloom: 'reed', petals: 6, leafCount: 1, scale: 1.1 },
  { id: 'moon_pod', label: 'Moon Pod', bloom: 'pod', petals: 5, leafCount: 2, scale: 0.98 }
]

export function getPlantType(id) {
  return PLANT_TYPES.find(plant => plant.id === id) || PLANT_TYPES[0]
}

export function getRandomPlantType() {
  const index = Math.floor(Math.random() * PLANT_TYPES.length)

  return PLANT_TYPES[index].id
}
