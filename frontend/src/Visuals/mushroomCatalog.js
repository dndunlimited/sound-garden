export const RANDOM_MUSHROOM_TYPE = 'random'

export const MUSHROOM_TYPES = [
  { id: 'ruby_cap', label: 'Ruby Cap', cap: 'round', spots: 5, stem: 'stout', scale: 1 },
  { id: 'moon_button', label: 'Moon Button', cap: 'button', spots: 0, stem: 'short', scale: 0.86 },
  { id: 'violet_bell', label: 'Violet Bell', cap: 'bell', spots: 4, stem: 'tall', scale: 1.06 },
  { id: 'amber_parasol', label: 'Amber Parasol', cap: 'parasol', spots: 7, stem: 'thin', scale: 1.14 },
  { id: 'blue_ink', label: 'Blue Ink', cap: 'ink', spots: 3, stem: 'tall', scale: 1 },
  { id: 'moss_cup', label: 'Moss Cup', cap: 'cup', spots: 0, stem: 'stout', scale: 0.94 },
  { id: 'coral_cluster', label: 'Coral Cluster', cap: 'cluster', spots: 0, stem: 'branch', scale: 1.04 },
  { id: 'ghost_shade', label: 'Ghost Shade', cap: 'ghost', spots: 2, stem: 'thin', scale: 0.98 },
  { id: 'speckle_dome', label: 'Speckle Dome', cap: 'dome', spots: 9, stem: 'short', scale: 1.02 },
  { id: 'golden_fan', label: 'Golden Fan', cap: 'fan', spots: 0, stem: 'thin', scale: 1.1 },
  { id: 'crimson_twin', label: 'Crimson Twin', cap: 'twin', spots: 6, stem: 'stout', scale: 0.96 },
  { id: 'star_morel', label: 'Star Morel', cap: 'morel', spots: 8, stem: 'tall', scale: 1.08 }
]

export function getMushroomType(id) {
  return MUSHROOM_TYPES.find(mushroom => mushroom.id === id) || MUSHROOM_TYPES[0]
}

export function getRandomMushroomType() {
  const index = Math.floor(Math.random() * MUSHROOM_TYPES.length)

  return MUSHROOM_TYPES[index].id
}
