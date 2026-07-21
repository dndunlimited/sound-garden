const SOUND_LIBRARY_DB_NAME = 'soundGardenAudio'
const SOUND_LIBRARY_DB_VERSION = 1
const SOUND_STORE_NAME = 'sounds'

let dbPromise = null

export async function loadSavedSounds() {
  const db = await openSoundLibraryDb()
  const sounds = await readAllSounds(db)

  return sounds
    .filter(sound => sound?.id && sound?.blob)
    .map(({ blob, ...metadata }) => metadata)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getSavedSound(id) {
  if (!id) return null

  const db = await openSoundLibraryDb()

  return readSound(db, id)
}

export async function saveUploadedSound(file) {
  if (!file?.type?.startsWith('audio/')) {
    throw new Error('Please choose an audio file.')
  }

  const sound = {
    id: createSoundId(),
    name: file.name || 'Uploaded sound',
    type: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    blob: file
  }
  const db = await openSoundLibraryDb()

  await writeSound(db, sound)

  const { blob, ...metadata } = sound

  return metadata
}

export async function removeSavedSound(id) {
  const db = await openSoundLibraryDb()

  await deleteSound(db, id)

  return loadSavedSounds()
}

function openSoundLibraryDb() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(SOUND_LIBRARY_DB_NAME, SOUND_LIBRARY_DB_VERSION)

    request.onupgradeneeded = event => {
      const db = event.target.result

      if (!db.objectStoreNames.contains(SOUND_STORE_NAME)) {
        db.createObjectStore(SOUND_STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = event => resolve(event.target.result)
    request.onerror = event => reject(event.target.error)
  })

  return dbPromise
}

function readAllSounds(db) {
  return runStoreRequest(db, 'readonly', store => store.getAll())
}

function readSound(db, id) {
  return runStoreRequest(db, 'readonly', store => store.get(id))
}

function writeSound(db, sound) {
  return runStoreRequest(db, 'readwrite', store => store.put(sound))
}

function deleteSound(db, id) {
  return runStoreRequest(db, 'readwrite', store => store.delete(id))
}

function runStoreRequest(db, mode, createRequest) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOUND_STORE_NAME, mode)
    const store = transaction.objectStore(SOUND_STORE_NAME)
    const request = createRequest(store)

    request.onsuccess = event => resolve(event.target.result)
    request.onerror = event => reject(event.target.error)
    transaction.onerror = event => reject(event.target.error)
  })
}

function createSoundId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `sound_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}
