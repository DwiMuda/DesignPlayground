import { onMounted, onUnmounted } from 'vue'

export function useKeyboard() {
  let keyboardHandlers = []

  const setupKeyboardShortcuts = (handlers = {}) => {
    const handleKeydown = (event) => {
      const isCtrl = event.ctrlKey || event.metaKey
      
      switch (event.key) {
        case 's':
          if (isCtrl) {
            event.preventDefault()
            handlers.onSave?.()
          }
          break
        case 'e':
          if (isCtrl) {
            event.preventDefault()
            handlers.onExport?.()
          }
          break
        case 'a':
          if (isCtrl) {
            event.preventDefault()
            handlers.onAddSection?.()
          }
          break
        case 'Delete':
        case 'Backspace':
          handlers.onDelete?.()
          break
        case 'Escape':
          handlers.onEscape?.()
          break
        case '=':
        case '+':
          if (isCtrl) {
            event.preventDefault()
            handlers.onZoomIn?.()
          }
          break
        case '-':
          if (isCtrl) {
            event.preventDefault()
            handlers.onZoomOut?.()
          }
          break
        case '0':
          if (isCtrl) {
            event.preventDefault()
            handlers.onResetZoom?.()
          }
          break
        case 'd':
          if (isCtrl) {
            event.preventDefault()
            handlers.onDuplicate?.()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeydown)
    keyboardHandlers.push(() => document.removeEventListener('keydown', handleKeydown))
  }

  const cleanupKeyboardShortcuts = () => {
    keyboardHandlers.forEach(cleanup => cleanup())
    keyboardHandlers = []
  }

  return {
    setupKeyboardShortcuts,
    cleanupKeyboardShortcuts
  }
}