// 存储键名常量
export const STORAGE_KEYS = {
  LANGUAGE: 'github-popular-language',
  SEARCH_HISTORY: 'github-popular-search-history',
  SORT_PREFERENCE: 'github-popular-sort',
  LANGUAGE_FILTER: 'github-popular-language-filter',
  THEME: 'github-popular-theme',
}

// 默认值
const DEFAULTS = {
  [STORAGE_KEYS.LANGUAGE]: 'zh',
  [STORAGE_KEYS.SORT_PREFERENCE]: 'stars',
  [STORAGE_KEYS.LANGUAGE_FILTER]: '',
  [STORAGE_KEYS.THEME]: 'light',
  [STORAGE_KEYS.SEARCH_HISTORY]: [],
}

// 获取存储值
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue !== null ? defaultValue : DEFAULTS[key]
    }
    return JSON.parse(item)
  } catch (error) {
    console.warn(`Failed to get storage item: ${key}`, error)
    return defaultValue !== null ? defaultValue : DEFAULTS[key]
  }
}

// 设置存储值
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Failed to set storage item: ${key}`, error)
    return false
  }
}

// 删除存储值
export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Failed to remove storage item: ${key}`, error)
    return false
  }
}

// 清空所有存储
export function clearStorage() {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.warn('Failed to clear storage', error)
    return false
  }
}

// 搜索历史管理
export function addSearchHistory(query) {
  if (!query || query.trim() === '') return

  const history = getStorage(STORAGE_KEYS.SEARCH_HISTORY, [])
  const trimmedQuery = query.trim()

  // 移除重复项
  const filteredHistory = history.filter(item => item !== trimmedQuery)

  // 添加到开头
  filteredHistory.unshift(trimmedQuery)

  // 限制历史记录数量
  if (filteredHistory.length > 10) {
    filteredHistory.splice(10)
  }

  setStorage(STORAGE_KEYS.SEARCH_HISTORY, filteredHistory)
}

export function getSearchHistory() {
  return getStorage(STORAGE_KEYS.SEARCH_HISTORY, [])
}

export function clearSearchHistory() {
  removeStorage(STORAGE_KEYS.SEARCH_HISTORY)
}

// 用户偏好管理
export function saveUserPreferences(preferences) {
  Object.entries(preferences).forEach(([key, value]) => {
    if (STORAGE_KEYS[key]) {
      setStorage(STORAGE_KEYS[key], value)
    }
  })
}

export function getUserPreferences() {
  const preferences = {}
  Object.values(STORAGE_KEYS).forEach(key => {
    preferences[key] = getStorage(key)
  })
  return preferences
}

// 检查存储是否可用
export function isStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}
