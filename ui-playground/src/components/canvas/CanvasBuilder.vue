<template>
  <div class="canvas-builder">
    <!-- Canvas Header dengan Controls -->
    <div class="canvas-header">
      <div class="header-left">
        <h2 class="canvas-title">Design Canvas</h2>
        <div class="canvas-stats">
          <span class="stat-item">
            <span class="stat-icon">📑</span>
            {{ sectionsCount }} Sections
          </span>
          <span class="stat-item">
            <span class="stat-icon">🧩</span>
            {{ elementsCount }} Elements
          </span>
          <span class="stat-icon">🔍</span>
            {{ Math.round(canvasStore.zoomLevel * 100) }}%
          
        </div>
      </div>

      <div class="header-right">
        <!-- Sidebar Tools -->
        <SidebarTools 
          :show-grid="canvasStore.showGrid"
          :show-rulers="showRulers"
          :show-outlines="showElementOutlines"
          :zoom-level="canvasStore.zoomLevel"
          @toggle-grid="toggleGrid"
          @toggle-rulers="toggleRulers"
          @toggle-outlines="toggleOutlines"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @reset-zoom="resetZoom"
        />

        <!-- Action Buttons -->
        <div class="action-controls">
          <button 
            @click="addNewSection" 
            class="action-btn primary"
            title="Add New Section"
          >
            <span class="btn-icon">➕</span>
            Add Section
          </button>
          
          <button 
            @click="clearCanvas" 
            class="action-btn secondary"
            :disabled="!sectionsCount"
            title="Clear Canvas"
          >
            <span class="btn-icon">🗑️</span>
            Clear
          </button>
          
          <button 
            @click="toggleExport" 
            class="action-btn tertiary"
            title="Export Design"
          >
            <span class="btn-icon">📤</span>
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Property Editor Sidebar -->
      <div v-if="selectedElement" class="property-sidebar">
        <PropertyEditor 
          :element="selectedElement"
          @update:element="handleElementUpdate"
          @delete:element="handleElementDelete"
        />
      </div>

      <!-- Canvas Content -->
      <div class="canvas-content" :class="{ 'with-sidebar': selectedElement }">
        <!-- Rulers (jika aktif) -->
        <div v-if="showRulers" class="rulers">
          <div class="horizontal-ruler">
            <div 
              v-for="mark in rulerMarks" 
              :key="'h-' + mark"
              class="ruler-mark"
              :class="{ major: mark % 100 === 0 }"
            >
              <span v-if="mark % 100 === 0" class="ruler-label">{{ mark }}px</span>
            </div>
          </div>
          <div class="vertical-ruler">
            <div 
              v-for="mark in rulerMarks" 
              :key="'v-' + mark"
              class="ruler-mark"
              :class="{ major: mark % 100 === 0 }"
            >
              <span v-if="mark % 100 === 0" class="ruler-label">{{ mark }}px</span>
            </div>
          </div>
        </div>

        <!-- Main Canvas Area -->
        <div class="canvas-main">
          <CanvasArea 
            :show-rulers="showRulers"
            :show-outlines="showElementOutlines"
            :show-grid="canvasStore.showGrid"
            @element-selected="handleElementSelected"
            @element-updated="handleElementUpdated"
            @section-added="handleSectionAdded"
          />
        </div>

        <!-- Canvas Footer dengan Status -->
        <div class="canvas-footer">
          <div class="footer-left">
            <span class="status-item" v-if="selectedElement">
              Selected: {{ selectedElement.type }} ({{ selectedElement.id?.slice(-6) }})
            </span>
            <span class="status-item" v-else>
              No element selected
            </span>
          </div>
          
          <div class="footer-right">
            <span class="status-item">
              Grid: {{ canvasStore.showGrid ? 'ON' : 'OFF' }}
            </span>
            <span class="status-item">
              Snap: {{ snapToGrid ? 'ON' : 'OFF' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Toolbar -->
    <div class="quick-actions">
      <button 
        v-for="action in quickActions"
        :key="action.id"
        @click="action.handler"
        class="quick-action-btn"
        :class="{ active: action.active }"
        :title="action.title"
      >
        <span class="action-icon">{{ action.icon }}</span>
        <span class="action-label">{{ action.label }}</span>
      </button>
    </div>

    <!-- Export Modal -->
    <ExportModal 
      v-if="uiStore.showExportModal"
      @close="uiStore.toggleExportModal"
      @export="handleExport"
    />

    <!-- Keyboard Shortcuts Help -->
    <div v-if="showShortcutsHelp" class="shortcuts-help">
      <div class="shortcuts-content">
        <h3>Keyboard Shortcuts</h3>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>Ctrl +</kbd> <span>Zoom In</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl -</kbd> <span>Zoom Out</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl 0</kbd> <span>Reset Zoom</span>
          </div>
          <div class="shortcut-item">
            <kbd>Delete</kbd> <span>Remove Element</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl + S</kbd> <span>Save</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl + D</kbd> <span>Duplicate</span>
          </div>
        </div>
        <button @click="showShortcutsHelp = false" class="close-help-btn">
          Got it!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '../stores/canvas'
import { useUIStore } from '../stores/ui'

// Import komponen sesuai struktur
import CanvasArea from './canvas/CanvasArea.vue'
import PropertyEditor from './properties/PropertyEditor.vue'
import SidebarTools from './sidebar/SidebarTools.vue'
import ExportModal from './sidebar/ExportModal.vue'

// Stores
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

// Reactive state
const showRulers = ref(false)
const showElementOutlines = ref(true)
const snapToGrid = ref(true)
const showShortcutsHelp = ref(false)

// Constants
const minZoom = 0.3
const maxZoom = 3
const rulerMarks = Array.from({ length: 21 }, (_, i) => i * 50) // 0 to 1000px

// Computed properties
const sectionsCount = computed(() => canvasStore.sections?.length || 0)
const elementsCount = computed(() => canvasStore.totalElements || 0)
const selectedElement = computed(() => canvasStore.selectedElement)

// Quick actions
const quickActions = computed(() => [
  {
    id: 'add-section',
    icon: '📑',
    label: 'Add Section',
    title: 'Add new section',
    handler: addNewSection,
    active: false
  },
  {
    id: 'toggle-grid',
    icon: '🎯',
    label: 'Grid',
    title: 'Toggle grid visibility',
    handler: toggleGrid,
    active: canvasStore.showGrid
  },
  {
    id: 'snap-grid',
    icon: '🧲',
    label: 'Snap',
    title: 'Toggle snap to grid',
    handler: toggleSnapToGrid,
    active: snapToGrid.value
  },
  {
    id: 'center-view',
    icon: '🎯',
    label: 'Center',
    title: 'Center canvas view',
    handler: centerCanvas,
    active: false
  },
  {
    id: 'shortcuts-help',
    icon: '⌨️',
    label: 'Help',
    title: 'Show keyboard shortcuts',
    handler: () => showShortcutsHelp.value = true,
    active: false
  }
])

// Methods
const toggleGrid = () => {
  canvasStore.setGridVisibility(!canvasStore.showGrid)
}

const toggleRulers = () => {
  showRulers.value = !showRulers.value
}

const toggleOutlines = () => {
  showElementOutlines.value = !showElementOutlines.value
}

const toggleSnapToGrid = () => {
  snapToGrid.value = !snapToGrid.value
  canvasStore.setSnapToGrid(snapToGrid.value)
}

const zoomIn = () => {
  if (canvasStore.zoomLevel < maxZoom) {
    canvasStore.setZoomLevel(canvasStore.zoomLevel + 0.1)
  }
}

const zoomOut = () => {
  if (canvasStore.zoomLevel > minZoom) {
    canvasStore.setZoomLevel(canvasStore.zoomLevel - 0.1)
  }
}

const resetZoom = () => {
  canvasStore.setZoomLevel(1)
}

const addNewSection = () => {
  const newSection = {
    id: generateId(),
    columns: [
      { 
        id: generateId(), 
        widgets: [],
        style: { flex: 1 }
      }
    ],
    style: {
      padding: '40px 20px',
      background: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      marginBottom: '20px'
    }
  }
  canvasStore.addSection(newSection)
}

const clearCanvas = () => {
  if (confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
    canvasStore.clearCanvas()
  }
}

const toggleExport = () => {
  uiStore.toggleExportModal()
}

const centerCanvas = () => {
  // Implementation untuk center canvas view
  console.log('🎯 Canvas view centered')
}

const handleElementSelected = (element) => {
  canvasStore.selectElement(element)
}

const handleElementUpdated = (element) => {
  canvasStore.updateElement(element)
}

const handleElementUpdate = (updatedElement) => {
  canvasStore.updateElement(updatedElement)
}

const handleElementDelete = (elementId) => {
  canvasStore.removeElement(elementId)
}

const handleSectionAdded = (section) => {
  canvasStore.addSection(section)
}

const handleExport = (exportOptions) => {
  console.log('Exporting with options:', exportOptions)
  // Implement export logic here
  uiStore.toggleExportModal()
  uiStore.addNotification({
    type: 'success',
    title: 'Export Successful',
    message: 'Your design has been exported successfully!'
  })
}

const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  const isCtrl = event.ctrlKey || event.metaKey
  
  if (isCtrl) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        handleSave()
        break
      case 'e':
        event.preventDefault()
        toggleExport()
        break
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
      case 'd':
        event.preventDefault()
        handleDuplicate()
        break
    }
  }
  
  if (event.key === 'Delete' && selectedElement.value) {
    event.preventDefault()
    canvasStore.removeElement(selectedElement.value.id)
    uiStore.addNotification({
      type: 'info',
      title: 'Element Removed',
      message: 'Selected element has been removed'
    })
  }
  
  if (event.key === 'Escape') {
    canvasStore.selectElement(null)
  }
}

const handleSave = () => {
  canvasStore.saveDesign()
  uiStore.addNotification({
    type: 'success',
    title: 'Design Saved',
    message: 'Your design has been saved successfully!'
  })
}

const handleDuplicate = () => {
  if (selectedElement.value) {
    canvasStore.duplicateElement(selectedElement.value.id)
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.canvas-builder {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
  height: 100vh;
}

/* Header Styles */
.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.canvas-title {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.canvas-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-icon {
  font-size: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Main Content Layout */
.main-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.property-sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
}

.canvas-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.canvas-content.with-sidebar {
  margin-right: 300px;
}

/* Action Controls */
.action-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #545b62;
}

.action-btn.tertiary {
  background: transparent;
  color: #495057;
  border: 1px solid #dee2e6;
}

.action-btn.tertiary:hover {
  background: #f8f9fa;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Rulers */
.rulers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}

.horizontal-ruler {
  position: absolute;
  top: 0;
  left: 40px;
  right: 0;
  height: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
}

.vertical-ruler {
  position: absolute;
  top: 20px;
  left: 0;
  bottom: 0;
  width: 40px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
}

.ruler-mark {
  position: relative;
  border-right: 1px solid #dee2e6;
}

.horizontal-ruler .ruler-mark {
  min-width: 50px;
  height: 100%;
}

.vertical-ruler .ruler-mark {
  min-height: 50px;
  width: 100%;
  border-right: none;
  border-bottom: 1px solid #dee2e6;
}

.ruler-mark.major {
  border-color: #adb5bd;
}

.ruler-label {
  position: absolute;
  font-size: 10px;
  color: #6c757d;
}

.horizontal-ruler .ruler-label {
  top: 2px;
  left: 2px;
}

.vertical-ruler .ruler-label {
  top: 2px;
  left: 2px;
  transform: rotate(-90deg);
  transform-origin: left top;
}

/* Canvas Main */
.canvas-main {
  flex: 1;
  position: relative;
  margin: 20px 0 0 40px;
  overflow: auto;
}

/* Footer */
.canvas-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 16px;
}

.status-item {
  padding: 2px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

/* Quick Actions */
.quick-actions {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.quick-action-btn:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.quick-action-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.action-icon {
  font-size: 16px;
}

.action-label {
  font-size: 11px;
  font-weight: 500;
}

/* Shortcuts Help */
.shortcuts-help {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.shortcuts-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.shortcuts-content h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.shortcut-item kbd {
  background: #2c3e50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.close-help-btn {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.close-help-btn:hover {
  background: #0056b3;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .canvas-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left,
  .header-right {
    justify-content: space-between;
  }
  
  .property-sidebar {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .canvas-header {
    padding: 12px 16px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .canvas-stats {
    gap: 8px;
  }
  
  .property-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .property-sidebar.open {
    transform: translateX(0);
  }
  
  .quick-actions {
    bottom: 16px;
    padding: 8px;
  }
  
  .quick-action-btn {
    min-width: 50px;
    padding: 6px 8px;
  }
  
  .action-label {
    font-size: 10px;
  }
}
</style>