import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'

export const useCanvasStore = defineStore('canvas', () => {
  const { saveToStorage, loadFromStorage } = useLocalStorage()

  // State
  const elements = ref([])
  const selectedElement = ref(null)
  const history = ref([])
  const historyIndex = ref(-1)

  // Computed
  const totalElements = computed(() => elements.value.length)
  const totalSections = computed(() => 
    elements.value.filter(el => el.type === 'section').length
  )
  
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Actions
  const addElement = (elementData) => {
    const newElement = {
      id: generateId(),
      type: elementData.type,
      text: elementData.text || '',
      src: elementData.src || '',
      style: elementData.style || {},
      position: elementData.position || { x: 100, y: 100 },
      children: elementData.children || [],
      ...elementData
    }
    
    elements.value.push(newElement)
    saveToHistory('add_element')
    saveToStorage('canvas-elements', elements.value)
    return newElement
  }

  const updateElement = (elementId, updates) => {
    const elementIndex = elements.value.findIndex(el => el.id === elementId)
    if (elementIndex !== -1) {
      elements.value[elementIndex] = { 
        ...elements.value[elementIndex], 
        ...updates 
      }
      saveToHistory('update_element')
      saveToStorage('canvas-elements', elements.value)
    }
  }

  const removeElement = (elementId) => {
    elements.value = elements.value.filter(el => el.id !== elementId)
    
    if (selectedElement.value?.id === elementId) {
      selectedElement.value = null
    }
    
    saveToHistory('remove_element')
    saveToStorage('canvas-elements', elements.value)
  }

  const selectElement = (element) => {
    selectedElement.value = element
  }

  const clearCanvas = () => {
    elements.value = []
    selectedElement.value = null
    saveToHistory('clear_canvas')
    saveToStorage('canvas-elements', elements.value)
  }

  const addSampleLayout = () => {
    const section = addElement({
      type: 'section',
      style: {
        padding: '40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        marginBottom: '20px'
      },
      children: [
        addElement({
          type: 'text',
          text: 'Welcome to Design Playground 🎨',
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px'
          },
          position: { x: 50, y: 50 }
        }),
        addElement({
          type: 'text',
          text: 'Drag elements from the sidebar to start building your amazing UI!',
          style: {
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            lineHeight: '1.6'
          },
          position: { x: 50, y: 120 }
        }),
        addElement({
          type: 'button',
          text: 'Get Started',
          style: {
            padding: '15px 30px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: '20px auto',
            display: 'block'
          },
          position: { x: 200, y: 200 }
        })
      ]
    })
  }

  // History Management
  const saveToHistory = (action) => {
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push({
      action,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(elements.value)),
      selected: selectedElement.value ? JSON.parse(JSON.stringify(selectedElement.value)) : null
    })
    historyIndex.value = history.value.length - 1
  }

  const undo = () => {
    if (canUndo.value) {
      historyIndex.value--
      const previousState = history.value[historyIndex.value]
      elements.value = JSON.parse(JSON.stringify(previousState.state))
      selectedElement.value = previousState.selected ? JSON.parse(JSON.stringify(previousState.selected)) : null
    }
  }

  const redo = () => {
    if (canRedo.value) {
      historyIndex.value++
      const nextState = history.value[historyIndex.value]
      elements.value = JSON.parse(JSON.stringify(nextState.state))
      selectedElement.value = nextState.selected ? JSON.parse(JSON.stringify(nextState.selected)) : null
    }
  }

  // Utility
  const generateId = () => {
    return `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize
  const initialize = () => {
    const saved = loadFromStorage('canvas-elements')
    if (saved) {
      elements.value = saved
    }
  }

  return {
    // State
    elements,
    selectedElement,
    
    // Computed
    totalElements,
    totalSections,
    canUndo,
    canRedo,
    
    // Actions
    addElement,
    updateElement,
    removeElement,
    selectElement,
    clearCanvas,
    addSampleLayout,
    undo,
    redo,
    initialize
  }
})