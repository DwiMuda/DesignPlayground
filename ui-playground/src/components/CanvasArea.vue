<template>
    <div class="canvas-area">
      <!-- Canvas Controls -->
      <div class="canvas-controls">
        <div class="control-group">
          <button 
            class="control-btn" 
            @click="zoomIn"
            title="Zoom In"
          >
            <span class="icon">+</span>
          </button>
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
          <button 
            class="control-btn" 
            @click="zoomOut"
            title="Zoom Out"
          >
            <span class="icon">−</span>
          </button>
          <button 
            class="control-btn" 
            @click="resetZoom"
            title="Reset Zoom"
          >
            <span class="icon">⟲</span>
          </button>
        </div>
        
        <div class="control-group">
          <button 
            class="control-btn" 
            :class="{ active: showGrid }"
            @click="toggleGrid"
            title="Toggle Grid"
          >
            <span class="icon">#</span>
          </button>
          <button 
            class="control-btn" 
            @click="centerCanvas"
            title="Center Canvas"
          >
            <span class="icon">⌖</span>
          </button>
        </div>
      </div>
  
      <!-- Main Canvas -->
      <div 
        ref="canvasRef"
        class="canvas"
        :class="{ 'show-grid': showGrid }"
        :style="canvasStyle"
        @click="handleCanvasClick"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <CanvasElement
          v-for="element in elements"
          :key="element.id"
          :element="element"
          :is-selected="selectedElement?.id === element.id"
          :zoom-level="zoomLevel"
          @select="selectElement(element)"
          @update="updateElement(element.id, $event)"
          @delete="deleteElement(element.id)"
        />
      </div>
  
      <!-- Empty State -->
      <div v-if="!elements.length" class="empty-state">
        <div class="empty-icon">🎨</div>
        <h3>Your canvas is empty</h3>
        <p>Drag elements from the sidebar or click to add new elements</p>
        <button class="cta-button" @click="addSampleElements">
          Add Sample Elements
        </button>
      </div>
  
      <!-- Selection Info -->
      <div v-if="selectedElement" class="selection-info">
        Selected: {{ selectedElement.type }} ({{ selectedElement.id }})
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useCanvasStore } from '@/stores/canvas'
  import CanvasElement from './CanvasElement.vue'
  
  // Stores
  const store = useCanvasStore()
  const { 
    elements, 
    selectedElement, 
    selectElement, 
    updateElement, 
    deleteElement, 
    addElement,
    initialize 
  } = store
  
  // Refs
  const canvasRef = ref(null)
  const zoomLevel = ref(1)
  const showGrid = ref(true)
  const panOffset = ref({ x: 0, y: 0 })
  
  // Computed
  const canvasStyle = computed(() => ({
    transform: `scale(${zoomLevel.value}) translate(${panOffset.value.x}px, ${panOffset.value.y}px)`,
    transformOrigin: '0 0',
    cursor: selectedElement.value ? 'grabbing' : 'default'
  }))
  
  // Methods
  const zoomIn = () => {
    zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3)
  }
  
  const zoomOut = () => {
    zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.3)
  }
  
  const resetZoom = () => {
    zoomLevel.value = 1
    panOffset.value = { x: 0, y: 0 }
  }
  
  const toggleGrid = () => {
    showGrid.value = !showGrid.value
  }
  
  const centerCanvas = () => {
    if (canvasRef.value) {
      const canvasRect = canvasRef.value.getBoundingClientRect()
      panOffset.value = {
        x: (canvasRect.width - 1200) / 2,
        y: (canvasRect.height - 800) / 2
      }
    }
  }
  
  const handleCanvasClick = (event) => {
    if (event.target === event.currentTarget) {
      selectElement(null)
    }
  }
  
  const handleDragOver = (event) => {
    event.preventDefault()
  }
  
  const handleDrop = (event) => {
    event.preventDefault()
    const elementData = event.dataTransfer.getData('application/json')
    if (elementData) {
      const element = JSON.parse(elementData)
      addElement({
        ...element,
        position: {
          x: event.offsetX - (element.style?.width || 100) / 2,
          y: event.offsetY - (element.style?.height || 40) / 2
        }
      })
    }
  }
  
  const addSampleElements = () => {
    addElement({
      type: 'button',
      text: 'Click Me',
      style: {
        padding: '12px 24px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
      },
      position: { x: 100, y: 100 }
    })
  
    addElement({
      type: 'text',
      text: 'Hello World',
      style: {
        padding: '8px 16px',
        backgroundColor: '#f8f9fa',
        color: '#333',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        fontSize: '16px'
      },
      position: { x: 100, y: 200 }
    })
  }
  
  // Keyboard shortcuts
  const handleKeydown = (event) => {
    if (event.key === 'Delete' && selectedElement.value) {
      deleteElement(selectedElement.value.id)
    }
    
    if (event.ctrlKey || event.metaKey) {
      if (event.key === '=') {
        event.preventDefault()
        zoomIn()
      } else if (event.key === '-') {
        event.preventDefault()
        zoomOut()
      } else if (event.key === '0') {
        event.preventDefault()
        resetZoom()
      }
    }
  }
  
  // Lifecycle
  onMounted(() => {
    initialize()
    document.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
  </script>
  
  <style scoped lang="scss">
  .canvas-area {
    flex: 1;
    position: relative;
    background: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  
    .canvas-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 100;
      display: flex;
      gap: 12px;
      background: rgba(255, 255, 255, 0.95);
      padding: 8px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(8px);
  
      .control-group {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 8px;
        
        &:not(:last-child) {
          border-right: 1px solid #e9ecef;
        }
      }
  
      .control-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: #f8f9fa;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
  
        &:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
  
        &.active {
          background: #3498db;
          color: white;
        }
  
        .icon {
          font-size: 14px;
          font-weight: 600;
        }
      }
  
      .zoom-level {
        font-size: 12px;
        font-weight: 600;
        color: #495057;
        min-width: 40px;
        text-align: center;
      }
    }
  
    .canvas {
      flex: 1;
      min-height: 100%;
      padding: 60px;
      position: relative;
      transition: transform 0.2s ease;
      background: white;
  
      &.show-grid {
        background: 
          linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
          linear-gradient(#f0f0f0 1px, transparent 1px);
        background-size: 20px 20px;
      }
    }
  
    .empty-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #6c757d;
  
      .empty-icon {
        font-size: 64px;
        margin-bottom: 20px;
        opacity: 0.7;
      }
  
      h3 {
        margin-bottom: 8px;
        color: #495057;
        font-weight: 600;
      }
  
      p {
        margin-bottom: 20px;
        color: #6c757d;
      }
  
      .cta-button {
        padding: 12px 24px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
  
        &:hover {
          background: #2980b9;
          transform: translateY(-1px);
        }
      }
    }
  
    .selection-info {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Monaco', 'Consolas', monospace;
    }
  }
  </style>