// Fun name generator for Quest Live players (Kahoot-style)

const adjectives = [
  'Fluffy',
  'Speedy',
  'Brave',
  'Happy',
  'Lucky',
  'Mighty',
  'Swift',
  'Clever',
  'Jolly',
  'Daring',
  'Cosmic',
  'Electric',
  'Turbo',
  'Ninja',
  'Pixel',
  'Quantum',
  'Cyber',
  'Blazing',
  'Epic',
  'Stellar',
  'Mystic',
  'Noble',
  'Radiant',
  'Thunder',
  'Warp',
  'Neon',
  'Hyper',
  'Ultra',
  'Mega',
  'Super',
]

const animals = [
  'Armadillo',
  'Penguin',
  'Tiger',
  'Dolphin',
  'Fox',
  'Panda',
  'Eagle',
  'Wolf',
  'Falcon',
  'Shark',
  'Dragon',
  'Phoenix',
  'Koala',
  'Otter',
  'Owl',
  'Jaguar',
  'Leopard',
  'Hawk',
  'Panther',
  'Lion',
  'Cheetah',
  'Raven',
  'Cobra',
  'Viper',
  'Griffin',
  'Unicorn',
  'Lynx',
  'Bear',
  'Raccoon',
  'Badger',
]

export function generateFunName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adj} ${animal}`
}

export function generateMultipleFunNames(count: number = 5): string[] {
  const names = new Set<string>()
  while (names.size < count) {
    names.add(generateFunName())
  }
  return Array.from(names)
}
