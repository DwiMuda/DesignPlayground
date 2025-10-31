export function useLocalStorage() {
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }

  const loadFromStorage = (key) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  const clearStorage = (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage
  }
}