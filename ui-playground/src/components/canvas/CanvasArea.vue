<template>
  <div 
    ref="canvasRef"
    class="canvas-area"
    :class="{ 'show-grid': canvasStore.showGrid }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="handleCanvasClick"
  >
    <!-- Visual drag feedback -->
    <div v-if="isDragOver" class="drag-overlay">
      <div class="drop-indicator">
        <span>🎯</span>
        <p>Drop to add element</p>
      </div>
    </div>

    <!-- Canvas Content -->
    <div class="canvas-content">
      <Section 
        v-for="section in canvasStore.sections" 
        :key="section.id" 
        :section="section"
        :selected-widget-id="selectedWidgetId"
        @select="handleSectionSelect"
        @widget-select="handleWidgetSelect"
        @widget-edit="handleWidgetEdit"
        @widget-delete="handleWidgetDelete"
        @add-column="handleAddColumn"
        @drop="handleSectionDrop"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!canvasStore.sections.length" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">🎨</div>
        <h3>Canvas Kosong</h3>
        <p>Drag element dari sidebar atau klik tombol dibawah</p>
        <button @click="addFirstSection" class="add-first-btn">
          ➕ Buat Section Pertama
        </button>
      </div>
    </div>

    <!-- Canvas Controls -->
    <div class="canvas-controls">
      <div class="control-group">
        <button 
          @click="toggleGrid" 
          class="control-btn"
          :class="{ active: canvasStore.showGrid }"
          title="Toggle Grid"
        >
          🎯
        </button>
        <button 
          @click="zoomOut" 
          class="control-btn"
          :disabled="canvasStore.zoomLevel <= 0.3"
          title="Zoom Out"
        >
          −
        </button>
        <span class="zoom-level">{{ Math.round(canvasStore.zoomLevel * 100) }}%</span>
        <button 
          @click="zoomIn" 
          class="control-btn"
          :disabled="canvasStore.zoomLevel >= 3"
          title="Zoom In"
        >
          +
        </button>
        <button 
          @click="resetZoom" 
          class="control-btn"
          title="Reset Zoom"
        >
          ⤢
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '../../stores/canvas'
import { useUIStore } from '../../stores/uiElements'
import Section from '../Section.vue'

const canvasStore = useCanvasStore()
const uiStore = useUIStore()
const canvasRef = ref(null)
const isDragOver = ref(false)

// Computed
const selectedWidgetId = computed(() => canvasStore.selectedElement?.id)

// Enhanced Drag & Drop
const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
  event.dataTransfer.dropEffect = 'copy'
}

const handleDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  try {
    const data = event.dataTransfer.getData('application/json')
    
    if (!data) {
      console.warn('❌ No data in drop event')
      return
    }

    const widgetData = JSON.parse(data)

    // Ensure we have at least one section
    if (!canvasStore.sections.length) {
      addFirstSection()
    }

    // Add widget to first column of first section
    const firstSection = canvasStore.sections[0]
    if (!firstSection?.columns?.length) {
      console.error('❌ No columns in section')
      return
    }

    const firstColumn = firstSection.columns[0]

    const newWidget = {
      type: widgetData.type,
      text: getDefaultText(widgetData.type),
      style: getDefaultStyle(widgetData.type),
      position: { x: 0, y: 0 }
    }

    canvasStore.addWidget(firstColumn.id, newWidget)
    console.log('✅ Widget added successfully:', newWidget)

  } catch (error) {
    console.error('❌ Drop error:', error)
  }
}

const handleCanvasClick = (event) => {
  if (event.target === canvasRef.value) {
    canvasStore.selectElement(null)
  }
}

const handleSectionSelect = (section) => {
  console.log('Section selected:', section)
}

const handleWidgetSelect = (data) => {
  canvasStore.selectElement(data.widget)
}

const handleWidgetEdit = (data) => {
  console.log('Edit widget:', data)
}

const handleWidgetDelete = (data) => {
  if (data.widget.id === canvasStore.selectedElement?.id) {
    canvasStore.selectElement(null)
  }
  canvasStore.removeElement(data.widget.id)
}

const handleAddColumn = (section) => {
  const newColumn = {
    id: generateId(),
    widgets: [],
    style: { flex: 1 }
  }
  section.columns.push(newColumn)
}

const handleSectionDrop = (data) => {
  console.log('Drop on section:', data)
  // Handle drop on specific section
}

const addFirstSection = () => {
  canvasStore.addSection({
    columns: [{ 
      id: generateId(), 
      widgets: [],
      style: { flex: 1 }
    }],
    style: {
      padding: '20px',
      background: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '8px'
    }
  })
}

// View Controls
const toggleGrid = () => {
  canvasStore.showGrid = !canvasStore.showGrid
}

const zoomIn = () => {
  if (canvasStore.zoomLevel < 3) {
    canvasStore.zoomLevel += 0.1
  }
}

const zoomOut = () => {
  if (canvasStore.zoomLevel > 0.3) {
    canvasStore.zoomLevel -= 0.1
  }
}

const resetZoom = () => {
  canvasStore.zoomLevel = 1
}

const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

const getDefaultText = (type) => {
  const texts = {
    text: 'This is a text element',
    button: 'Click Me',
    heading: 'Heading Text',
    image: '',
    card: 'Card content goes here...',
    divider: ''
  }
  return texts[type] || 'Content'
}

const getDefaultStyle = (type) => {
  const baseStyles = {
    text: { 
      padding: '12px', 
      color: '#333',
      fontSize: '14px',
      lineHeight: '1.5',
      backgroundColor: '#ffffff'
    },
    button: { 
      padding: '10px 20px', 
      background: '#007bff', 
      color: 'white', 
      border: 'none', 
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    heading: { 
      padding: '16px 12px', 
      fontSize: '24px', 
      fontWeight: 'bold', 
      color: '#2c3e50',
      margin: '0'
    },
    image: { 
      width: '200px', 
      height: '150px', 
      background: '#f8f9fa', 
      border: '2px dashed #dee2e6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
      borderRadius: '4px'
    },
    card: {
      padding: '20px',
      background: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    divider: {
      height: '1px',
      background: '#e9ecef',
      margin: '20px 0',
      border: 'none'
    }
  }
  return baseStyles[type] || { padding: '10px', background: '#f8f9fa' }
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case '=':
      case '+':
        event.preventDefault()
        zoomIn()
        break
      case '-':
        event.preventDefault()
        zoomOut()
        break
      case '0':
        event.preventDefault()
        resetZoom()
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  console.log('🎯 CanvasArea mounted')
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.canvas-area {
  flex: 1;
  background: #ffffff;
  position: relative;
  min-height: 100vh;
  padding: 20px;
  overflow: auto;
  transition: all 0.3s ease;
}

.canvas-area.show-grid {
  background-image: 
    linear-gradient(90deg, rgba(0, 123, 255, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(0, 123, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 123, 255, 0.05);
  border: 3px dashed #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
  animation: pulse 1.5s infinite;
}

.drop-indicator {
  text-align: center;
  color: #007bff;
  font-weight: 500;
}

.drop-indicator span {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.drop-indicator p {
  margin: 0;
  font-size: 16px;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.canvas-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #6c757d;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-content h3 {
  margin-bottom: 8px;
  color: #495057;
  font-size: 20px;
  font-weight: 600;
}

.empty-content p {
  line-height: 1.5;
  color: #6c757d;
  margin-bottom: 20px;
}

.add-first-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-first-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.canvas-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
  color: #495057;
}

.control-btn:hover:not(:disabled) {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.active {
  background: #007bff;
  color: white;
}

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  padding: 0 8px;
}
</style>