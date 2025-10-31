import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCanvasStore = defineStore('canvas', () => {
  // State
  const sections = ref([])
  const selectedElement = ref(null)
  const zoomLevel = ref(1)
  const showGrid = ref(true)
  const snapToGrid = ref(true)
  const history = ref([])
  const historyIndex = ref(-1)
  const isDragging = ref(false)
  const canvasSize = ref({ width: 1200, height: 800 })

  // Debug logging dengan levels
  const log = (action, data, level = 'info') => {
    const levels = {
      info: '🔵',
      success: '🟢',
      warning: '🟡',
      error: '🔴'
    }
    console.log(`${levels[level] || '🔵'} Canvas Store - ${action}:`, data)
  }

  // Auto-save ke localStorage
  const STORAGE_KEY = 'canvas-design'
  
  // Load dari localStorage saat initialize
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        sections.value = parsed.sections || []
        zoomLevel.value = parsed.zoomLevel || 1
        showGrid.value = parsed.showGrid ?? true
        log('LOAD_FROM_STORAGE', 'Design loaded successfully', 'success')
      }
    } catch (error) {
      log('LOAD_FROM_STORAGE_ERROR', error, 'error')
    }
  }

  // Save ke localStorage
  const saveToStorage = () => {
    try {
      const design = {
        sections: sections.value,
        zoomLevel: zoomLevel.value,
        showGrid: showGrid.value,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(design))
      log('SAVE_TO_STORAGE', 'Design saved successfully', 'success')
    } catch (error) {
      log('SAVE_TO_STORAGE_ERROR', error, 'error')
    }
  }

  // Getters
  const totalWidgets = computed(() => {
    return sections.value.reduce((total, section) => {
      return total + section.columns.reduce((colTotal, column) => {
        return colTotal + (column.widgets?.length || 0)
      }, 0)
    }, 0)
  })

  const allElements = computed(() => {
    return sections.value.flatMap(section => 
      section.columns.flatMap(column => 
        (column.widgets || []).map(widget => ({
          ...widget,
          sectionId: section.id,
          columnId: column.id,
          sectionTitle: section.title,
          columnIndex: section.columns.indexOf(column)
        }))
      )
    )
  })

  const selectedSection = computed(() => {
    if (!selectedElement.value) return null
    return sections.value.find(section => 
      section.columns.some(column => 
        column.widgets.some(widget => widget.id === selectedElement.value.id)
      )
    )
  })

  const isEmpty = computed(() => {
    return sections.value.length === 0 || totalWidgets.value === 0
  })

  const designStats = computed(() => {
    const elementsByType = {}
    allElements.value.forEach(element => {
      elementsByType[element.type] = (elementsByType[element.type] || 0) + 1
    })

    return {
      totalSections: sections.value.length,
      totalElements: totalWidgets.value,
      elementsByType,
      canvasSize: canvasSize.value
    }
  })

  // Actions
  const addSection = (sectionData) => {
    const newSection = {
      id: generateId(),
      title: sectionData.title || `Section ${sections.value.length + 1}`,
      columns: sectionData.columns || [{ 
        id: generateId(), 
        widgets: [],
        style: { flex: 1 }
      }],
      style: {
        padding: '20px',
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        marginBottom: '20px',
        ...sectionData.style
      },
      layout: sectionData.layout || 'horizontal',
      ...sectionData
    }
    
    sections.value.push(newSection)
    saveToHistory('ADD_SECTION')
    log('ADD_SECTION', newSection, 'success')
    return newSection
  }

  const addWidget = (columnId, widgetData) => {
    log('ADD_WIDGET_START', { columnId, widgetData })
    
    for (let section of sections.value) {
      for (let column of section.columns) {
        if (column.id === columnId) {
          const newWidget = {
            id: generateId(),
            type: widgetData.type || 'text',
            content: widgetData.content || getDefaultContent(widgetData.type),
            style: {
              ...getDefaultStyle(widgetData.type),
              ...widgetData.style
            },
            position: widgetData.position || { x: 0, y: 0 },
            locked: false,
            visible: true,
            ...widgetData
          }
          
          if (!column.widgets) {
            column.widgets = []
          }
          
          column.widgets.push(newWidget)
          saveToHistory('ADD_WIDGET')
          log('ADD_WIDGET_SUCCESS', newWidget, 'success')
          return newWidget
        }
      }
    }
    
    log('ADD_WIDGET_ERROR', { columnId, reason: 'Column not found' }, 'error')
    return null
  }

  const selectElement = (element) => {
    selectedElement.value = element
    log('SELECT_ELEMENT', element)
  }

  const updateElement = (elementId, updates) => {
    for (let section of sections.value) {
      for (let column of section.columns) {
        const widgetIndex = column.widgets.findIndex(w => w.id === elementId)
        if (widgetIndex !== -1) {
          const oldWidget = { ...column.widgets[widgetIndex] }
          column.widgets[widgetIndex] = { ...oldWidget, ...updates }
          saveToHistory('UPDATE_ELEMENT', { elementId, oldWidget, updates })
          log('UPDATE_ELEMENT', { elementId, updates }, 'success')
          return true
        }
      }
    }
    return false
  }

  const removeElement = (elementId) => {
    for (let section of sections.value) {
      for (let column of section.columns) {
        const widgetIndex = column.widgets.findIndex(w => w.id === elementId)
        if (widgetIndex !== -1) {
          const removedWidget = column.widgets[widgetIndex]
          column.widgets.splice(widgetIndex, 1)
          
          if (selectedElement.value?.id === elementId) {
            selectedElement.value = null
          }
          
          saveToHistory('REMOVE_ELEMENT', { elementId, removedWidget })
          log('REMOVE_ELEMENT', elementId, 'success')
          return true
        }
      }
    }
    return false
  }

  const removeSection = (sectionId) => {
    const sectionIndex = sections.value.findIndex(s => s.id === sectionId)
    if (sectionIndex !== -1) {
      const removedSection = sections.value[sectionIndex]
      sections.value.splice(sectionIndex, 1)
      
      // Deselect jika element yang dipilih ada di section yang dihapus
      if (selectedElement.value && 
          removedSection.columns.some(col => 
            col.widgets.some(w => w.id === selectedElement.value.id))) {
        selectedElement.value = null
      }
      
      saveToHistory('REMOVE_SECTION', { sectionId, removedSection })
      log('REMOVE_SECTION', sectionId, 'success')
      return true
    }
    return false
  }

  const clearCanvas = () => {
    const oldSections = [...sections.value]
    sections.value = []
    selectedElement.value = null
    saveToHistory('CLEAR_CANVAS', { oldSections })
    log('CLEAR_CANVAS', 'Canvas cleared', 'success')
  }

  const duplicateElement = (elementId) => {
    for (let section of sections.value) {
      for (let column of section.columns) {
        const originalWidget = column.widgets.find(w => w.id === elementId)
        if (originalWidget) {
          const duplicatedWidget = {
            ...originalWidget,
            id: generateId(),
            position: {
              x: (originalWidget.position?.x || 0) + 20,
              y: (originalWidget.position?.y || 0) + 20
            }
          }
          column.widgets.push(duplicatedWidget)
          saveToHistory('DUPLICATE_ELEMENT', { originalWidget, duplicatedWidget })
          log('DUPLICATE_ELEMENT', duplicatedWidget, 'success')
          return duplicatedWidget
        }
      }
    }
    return null
  }

  // History management
  const saveToHistory = (action, data = {}) => {
    // Remove any future history
    history.value = history.value.slice(0, historyIndex.value + 1)
    
    const historyEntry = {
      id: generateId(),
      action,
      timestamp: new Date().toISOString(),
      data,
      state: JSON.parse(JSON.stringify({
        sections: sections.value,
        selectedElement: selectedElement.value
      }))
    }
    
    history.value.push(historyEntry)
    historyIndex.value = history.value.length - 1
    
    // Limit history size
    if (history.value.length > 50) {
      history.value.shift()
      historyIndex.value--
    }
  }

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      const previousState = history.value[historyIndex.value].state
      sections.value = previousState.sections
      selectedElement.value = previousState.selectedElement
      log('UNDO', `Action: ${history.value[historyIndex.value].action}`, 'warning')
    }
  }

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      const nextState = history.value[historyIndex.value].state
      sections.value = nextState.sections
      selectedElement.value = nextState.selectedElement
      log('REDO', `Action: ${history.value[historyIndex.value].action}`, 'warning')
    }
  }

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // View controls
  const setZoomLevel = (level) => {
    zoomLevel.value = Math.max(0.1, Math.min(5, level))
    log('SET_ZOOM_LEVEL', zoomLevel.value)
  }

  const zoomIn = () => {
    setZoomLevel(zoomLevel.value + 0.1)
  }

  const zoomOut = () => {
    setZoomLevel(zoomLevel.value - 0.1)
  }

  const resetZoom = () => {
    zoomLevel.value = 1
    log('RESET_ZOOM')
  }

  const toggleGrid = () => {
    showGrid.value = !showGrid.value
    log('TOGGLE_GRID', showGrid.value)
  }

  const setSnapToGrid = (enabled) => {
    snapToGrid.value = enabled
    log('SET_SNAP_TO_GRID', enabled)
  }

  // Helper functions
  const generateId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9)
  }

  const getDefaultContent = (type) => {
    const contents = {
      text: 'Text content',
      heading: 'Heading',
      button: 'Click me',
      paragraph: 'Paragraph text goes here...',
      image: 'Image description',
      card: 'Card content',
      input: 'Enter text...',
      textarea: 'Enter longer text...',
      link: 'Learn more',
      icon: '⭐',
      divider: ''
    }
    return contents[type] || 'Content'
  }

  const getDefaultStyle = (type) => {
    const styles = {
      text: { 
        fontSize: '14px', 
        color: '#333333',
        lineHeight: '1.5'
      },
      button: { 
        backgroundColor: '#3b82f6', 
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer'
      },
      heading: { 
        fontSize: '24px', 
        fontWeight: 'bold',
        color: '#1f2937',
        margin: '0 0 8px 0'
      },
      paragraph: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#4b5563'
      },
      image: {
        backgroundColor: '#f3f4f6',
        border: '2px dashed #d1d5db',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }
    }
    return styles[type] || {}
  }

  // Export/Import
  const exportDesign = () => {
    const design = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sections: sections.value,
      canvasSize: canvasSize.value,
      stats: designStats.value
    }
    return JSON.stringify(design, null, 2)
  }

  const importDesign = (designData) => {
    try {
      const design = JSON.parse(designData)
      sections.value = design.sections || []
      canvasSize.value = design.canvasSize || { width: 1200, height: 800 }
      selectedElement.value = null
      saveToHistory('IMPORT_DESIGN')
      log('IMPORT_DESIGN', 'Design imported successfully', 'success')
      return true
    } catch (error) {
      log('IMPORT_DESIGN_ERROR', error, 'error')
      return false
    }
  }

  // Auto-save ketika sections berubah
  watch(sections, saveToStorage, { deep: true })

  // Initialize
  loadFromStorage()

  return {
    // State
    sections,
    selectedElement,
    zoomLevel,
    showGrid,
    snapToGrid,
    isDragging,
    canvasSize,
    history,
    historyIndex,

    // Getters
    totalWidgets,
    allElements,
    selectedSection,
    isEmpty,
    designStats,
    canUndo,
    canRedo,

    // Actions
    addSection,
    addWidget,
    selectElement,
    updateElement,
    removeElement,
    removeSection,
    clearCanvas,
    duplicateElement,
    
    // History
    undo,
    redo,
    
    // View Controls
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleGrid,
    setSnapToGrid,
    
    // Export/Import
    exportDesign,
    importDesign,
    
    // Helpers
    generateId
  }
})