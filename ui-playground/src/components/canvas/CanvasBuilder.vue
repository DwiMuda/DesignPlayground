<template>
    <div 
      class="canvas-builder"
      :class="{ 'preview-mode': previewMode, 'has-selection': selectedElement }"
      @click="handleCanvasClick"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      <!-- Canvas Header -->
      <div v-if="!previewMode" class="canvas-header">
        <div class="canvas-info">
          <h3 class="canvas-title">Design Canvas</h3>
          <div class="canvas-stats">
            <span class="stat">{{ totalElements }} elements</span>
            <span class="stat">{{ totalSections }} sections</span>
          </div>
        </div>
        <div class="canvas-controls">
          <button class="control-btn" @click="zoomOut" title="Zoom Out">
            <span class="control-icon">🔍−</span>
          </button>
          <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
          <button class="control-btn" @click="zoomIn" title="Zoom In">
            <span class="control-icon">🔍+</span>
          </button>
          <button class="control-btn" @click="resetZoom" title="Reset Zoom">
            <span class="control-icon">⟲</span>
          </button>
          <button class="control-btn" @click="centerCanvas" title="Center View">
            <span class="control-icon">⌖</span>
          </button>
        </div>
      </div>
  
      <!-- Canvas Area -->
      <div 
        class="canvas-area"
        :style="canvasStyle"
        @mousedown="startPan"
        @mousemove="handlePan"
        @mouseup="stopPan"
        @mouseleave="stopPan"
      >
        <!-- Grid Background -->
        <div v-if="!previewMode && showGrid" class="canvas-grid"></div>
  
        <!-- Elements Container -->
        <div class="elements-container">
          <Widget
            v-for="element in elements"
            :key="element.id"
            :element="element"
            :selected="selectedElement?.id === element.id"
            :zoom="zoom"
            @select="handleElementSelect(element)"
            @update:element="handleElementUpdate(element.id, $event)"
            @delete="handleElementDelete(element.id)"
          />
        </div>
  
        <!-- Empty State -->
        <div v-if="!elements.length" class="empty-canvas">
          <div class="empty-content">
            <div class="empty-icon">🎨</div>
            <h3 class="empty-title">Your canvas is empty</h3>
            <p class="empty-description">
              Drag elements from the sidebar or click to add sample content
            </p>
            <div class="empty-actions">
              <button class="empty-btn primary" @click="addSampleLayout">
                <span class="btn-icon">🚀</span>
                Add Sample Layout
              </button>
              <button class="empty-btn" @click="showHelp = true">
                <span class="btn-icon">❓</span>
                Show Tutorial
              </button>
            </div>
          </div>
        </div>
  
        <!-- Selection Box -->
        <div 
          v-if="selectedElement && !previewMode" 
          class="selection-box"
          :style="selectionBoxStyle"
        >
          <div class="selection-info">
            <span class="selection-type">{{ getElementTypeName(selectedElement.type) }}</span>
            <span class="selection-id">{{ selectedElement.id.slice(0, 8) }}</span>
          </div>
        </div>
      </div>
  
      <!-- Canvas Guides -->
      <div v-if="!previewMode" class="canvas-guides">
        <div class="horizontal-guide" :style="{ top: '50%' }"></div>
        <div class="vertical-guide" :style="{ left: '50%' }"></div>
      </div>
  
      <!-- Help Overlay -->
      <Teleport to="body">
        <div v-if="showHelp" class="help-overlay" @click="showHelp = false">
          <div class="help-content" @click.stop>
            <div class="help-header">
              <h2>Canvas Guide</h2>
              <button class="close-btn" @click="showHelp = false">
                <span class="close-icon">×</span>
              </button>
            </div>
            <div class="help-body">
              <div class="help-item">
                <div class="help-step">1</div>
                <div class="help-text">
                  <strong>Drag & Drop</strong> elements from the sidebar to the canvas
                </div>
              </div>
              <div class="help-item">
                <div class="help-step">2</div>
                <div class="help-text">
                  <strong>Click</strong> on elements to select and edit properties
                </div>
              </div>
              <div class="help-item">
                <div class="help-step">3</div>
                <div class="help-text">
                  <strong>Double-click</strong> text elements to edit content
                </div>
              </div>
              <div class="help-item">
                <div class="help-step">4</div>
                <div class="help-text">
                  Use <strong>mouse wheel</strong> to zoom in/out
                </div>
              </div>
              <div class="help-item">
                <div class="help-step">5</div>
                <div class="help-text">
                  <strong>Drag canvas</strong> with middle mouse button to pan
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useCanvasStore } from '../../stores/canvas'
  import { ELEMENT_NAMES } from '../../utils/constants'
  import Widget from '../common/Widget.vue'
  
  const props = defineProps({
    previewMode: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['select-element'])
  
  // Store
  const store = useCanvasStore()
  
  // State
  const zoom = ref(1)
  const pan = ref({ x: 0, y: 0 })
  const isPanning = ref(false)
  const lastPanPoint = ref({ x: 0, y: 0 })
  const showGrid = ref(true)
  const showHelp = ref(false)
  
  // Computed
  const elements = computed(() => store.elements)
  const selectedElement = computed(() => store.selectedElement)
  const totalElements = computed(() => store.totalElements)
  const totalSections = computed(() => store.totalSections)
  
  const canvasStyle = computed(() => ({
    transform: `scale(${zoom.value}) translate(${pan.value.x}px, ${pan.value.y}px)`,
    transformOrigin: '0 0',
    cursor: isPanning.value ? 'grabbing' : 'default'
  }))
  
  const selectionBoxStyle = computed(() => {
    if (!selectedElement.value?.position) return {}
    
    return {
      left: `${selectedElement.value.position.x - 4}px`,
      top: `${selectedElement.value.position.y - 4}px`,
      width: `calc(${selectedElement.value.style.width || '100px'} + 8px)`,
      height: `calc(${selectedElement.value.style.height || 'auto'} + 8px)`
    }
  })
  
  // Methods
  const handleCanvasClick = (event) => {
    if (event.target === event.currentTarget) {
      store.selectElement(null)
      emit('select-element', null)
    }
  }
  
  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }
  
  const handleDrop = (event) => {
    event.preventDefault()
    
    const elementData = event.dataTransfer.getData('application/json')
    if (elementData) {
      try {
        const element = JSON.parse(elementData)
        const rect = event.currentTarget.getBoundingClientRect()
        
        const newElement = store.addElement({
          ...element,
          position: {
            x: (event.clientX - rect.left - pan.value.x) / zoom.value,
            y: (event.clientY - rect.top - pan.value.y) / zoom.value
          }
        })
        
        store.selectElement(newElement)
        emit('select-element', newElement)
      } catch (error) {
        console.error('Error parsing dropped element:', error)
      }
    }
  }
  
  const handleElementSelect = (element) => {
    store.selectElement(element)
    emit('select-element', element)
  }
  
  const handleElementUpdate = (elementId, updates) => {
    store.updateElement(elementId, updates)
  }
  
  const handleElementDelete = (elementId) => {
    store.removeElement(elementId)
    emit('select-element', null)
  }
  
  // Zoom & Pan
  const zoomIn = () => {
    zoom.value = Math.min(zoom.value + 0.1, 3)
  }
  
  const zoomOut = () => {
    zoom.value = Math.max(zoom.value - 0.1, 0.3)
  }
  
  const resetZoom = () => {
    zoom.value = 1
    pan.value = { x: 0, y: 0 }
  }
  
  const centerCanvas = () => {
    pan.value = { x: 0, y: 0 }
  }
  
  const startPan = (event) => {
    if (event.button === 1 || (event.button === 0 && event.altKey)) { // Middle click or Alt + Left click
      isPanning.value = true
      lastPanPoint.value = { x: event.clientX, y: event.clientY }
      event.preventDefault()
    }
  }
  
  const handlePan = (event) => {
    if (!isPanning.value) return
    
    const deltaX = event.clientX - lastPanPoint.value.x
    const deltaY = event.clientY - lastPanPoint.value.y
    
    pan.value.x += deltaX / zoom.value
    pan.value.y += deltaY / zoom.value
    
    lastPanPoint.value = { x: event.clientX, y: event.clientY }
  }
  
  const stopPan = () => {
    isPanning.value = false
  }
  
  // Mouse wheel zoom
  const handleWheel = (event) => {
    if (event.ctrlKey) {
      event.preventDefault()
      const delta = -event.deltaY * 0.01
      zoom.value = Math.max(0.3, Math.min(3, zoom.value + delta))
    }
  }
  
  const getElementTypeName = (type) => {
    return ELEMENT_NAMES[type] || 'Element'
  }
  
  const addSampleLayout = () => {
    store.addSampleLayout()
  }
  
  // Event listeners
  onMounted(() => {
    window.addEventListener('wheel', handleWheel, { passive: false })
  })
  
  onUnmounted(() => {
    window.removeEventListener('wheel', handleWheel)
  })
  </script>
  
  <style scoped>
  .canvas-builder {
    flex: 1;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  
  /* Canvas Header */
  .canvas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .canvas-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .canvas-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
  }
  
  .canvas-stats {
    display: flex;
    gap: 12px;
  }
  
  .stat {
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
  }
  
  .canvas-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    padding: 8px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: white;
    color: #475569;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .control-btn:hover {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }
  
  .zoom-level {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    min-width: 50px;
    text-align: center;
  }
  
  /* Canvas Area */
  .canvas-area {
    flex: 1;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease;
    background: white;
  }
  
  /* Grid Background */
  .canvas-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    opacity: 0.6;
  }
  
  /* Elements Container */
  .elements-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 600px;
  }
  
  /* Empty State */
  .empty-canvas {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(248, 250, 252, 0.8);
    backdrop-filter: blur(4px);
  }
  
  .empty-content {
    text-align: center;
    max-width: 400px;
    padding: 40px;
  }
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 24px;
    opacity: 0.7;
  }
  
  .empty-title {
    margin: 0 0 12px 0;
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
  }
  
  .empty-description {
    margin: 0 0 32px 0;
    color: #64748b;
    line-height: 1.6;
    font-size: 16px;
  }
  
  .empty-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .empty-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: 2px solid #e2e8f0;
    background: white;
    color: #475569;
    border-radius: 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .empty-btn:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .empty-btn.primary {
    background: #667eea;
    border-color: #667eea;
    color: white;
  }
  
  .empty-btn.primary:hover {
    background: #5a67d8;
    border-color: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  /* Selection Box */
  .selection-box {
    position: absolute;
    border: 2px solid #667eea;
    border-radius: 8px;
    pointer-events: none;
    z-index: 10;
    box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.1);
  }
  
  .selection-info {
    position: absolute;
    top: -30px;
    left: 0;
    background: #667eea;
    color: white;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    display: flex;
    gap: 8px;
  }
  
  .selection-type {
    font-weight: 700;
  }
  
  .selection-id {
    opacity: 0.8;
    font-family: 'Monaco', 'Consolas', monospace;
  }
  
  /* Canvas Guides */
  .canvas-guides {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 5;
  }
  
  .horizontal-guide,
  .vertical-guide {
    position: absolute;
    background: rgba(102, 126, 234, 0.3);
  }
  
  .horizontal-guide {
    left: 0;
    right: 0;
    height: 1px;
  }
  
  .vertical-guide {
    top: 0;
    bottom: 0;
    width: 1px;
  }
  
  /* Help Overlay */
  .help-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
  }
  
  .help-content {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    animation: modalSlideIn 0.4s ease-out;
  }
  
  .help-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 0;
  }
  
  .help-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #64748b;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .close-btn:hover {
    background: #f1f5f9;
    color: #475569;
  }
  
  .help-body {
    padding: 24px;
  }
  
  .help-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .help-item:last-child {
    border-bottom: none;
  }
  
  .help-step {
    width: 32px;
    height: 32px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  .help-text {
    color: #475569;
    line-height: 1.5;
  }
  
  .help-text strong {
    color: #1e293b;
    font-weight: 700;
  }
  
  /* Animations */
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  /* Preview Mode */
  .preview-mode .canvas-header,
  .preview-mode .canvas-grid,
  .preview-mode .canvas-guides,
  .preview-mode .selection-box {
    display: none;
  }
  
  .preview-mode .canvas-area {
    background: white;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .canvas-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
    
    .canvas-info {
      justify-content: space-between;
    }
    
    .canvas-controls {
      justify-content: center;
    }
    
    .empty-actions {
      flex-direction: column;
    }
  }
  </style>