import { onMounted, onUnmounted } from 'vue'

export function useKeyboard(shortcuts) {
  const handleKeydown = (event) => {
    for (const shortcut of shortcuts) {
      const { key, ctrlKey = false, shiftKey = false, altKey = false, action } = shortcut
      
      if (
        event.key === key &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey
      ) {
        event.preventDefault()
        action()
        break
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    // Optional: methods to dynamically update shortcuts
  }
}