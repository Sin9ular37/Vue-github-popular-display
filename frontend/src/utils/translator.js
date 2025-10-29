import axios from 'axios'

const STORAGE_KEY = 'github-popular-translation-cache'
const STORAGE_LIMIT = 200
const DEFAULT_TO = 'zh'
const TRANSLATE_ENDPOINT =
  import.meta.env.VITE_TRANSLATE_ENDPOINT ||
  (import.meta.env.DEV ? 'http://localhost:5174/translate' : '/translate')

const memoryCache = new Map()
const pendingMap = new Map()
let storageLoaded = false
let storageAvailable = true
let translationDisabled = false

function makeKey(text, target) {
  return `${target}::${text}`
}

function loadStorage() {
  if (storageLoaded) return
  storageLoaded = true

  if (typeof window === 'undefined' || !window.localStorage) {
    storageAvailable = false
    return
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      parsed.forEach(([key, value]) => {
        if (typeof key === 'string' && typeof value === 'string') {
          memoryCache.set(key, value)
        }
      })
    }
  } catch (error) {
    console.warn('Failed to load translation cache:', error)
    storageAvailable = false
  }
}

function persistStorage() {
  if (!storageAvailable) return
  try {
    const entries = Array.from(memoryCache.entries())
    const trimmed = entries.slice(-STORAGE_LIMIT)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.warn('Failed to persist translation cache:', error)
    storageAvailable = false
  }
}

function cacheResult(text, target, translation) {
  const key = makeKey(text, target)
  memoryCache.set(key, translation)
  persistStorage()
}

function getCached(text, target) {
  loadStorage()
  const key = makeKey(text, target)
  return memoryCache.get(key) || null
}

async function requestTranslation(text, target) {
  if (translationDisabled || !TRANSLATE_ENDPOINT) {
    return text
  }

  try {
    const response = await axios.post(TRANSLATE_ENDPOINT, {
      text,
      target,
    })

    const translated = response.data?.translation
    if (typeof translated === 'string' && translated.length > 0) {
      cacheResult(text, target, translated)
      return translated
    }

    if (response.data?.error) {
      console.warn('Translation service responded with error:', response.data)
    }

    return text
  } catch (error) {
    translationDisabled = true
    console.warn('Translation service unavailable, fallback to original text.', error)
    return text
  }
}

export async function translateText(text, target = DEFAULT_TO) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const trimmed = text.trim()
  if (!trimmed) {
    return ''
  }

  const cached = getCached(trimmed, target)
  if (cached) {
    return cached
  }

  const key = makeKey(trimmed, target)
  if (pendingMap.has(key)) {
    return pendingMap.get(key)
  }

  const requestPromise = requestTranslation(trimmed, target).finally(() => {
    pendingMap.delete(key)
  })

  pendingMap.set(key, requestPromise)
  return requestPromise
}

export async function translateBatch(texts, target = DEFAULT_TO) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return {}
  }

  const uniqueTexts = [
    ...new Set(
      texts
        .map(text => (typeof text === 'string' ? text.trim() : ''))
        .filter(Boolean)
    ),
  ]

  const results = {}
  await Promise.all(
    uniqueTexts.map(async text => {
      const translated = await translateText(text, target)
      results[text] = translated
    })
  )

  return results
}
