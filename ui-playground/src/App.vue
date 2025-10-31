<template>
  <div class="app" :class="{ 'preview-mode': isPreview, 'export-open': showExportModal }">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🎨</span>
          <h1 class="logo-text">Design Playground</h1>
        </div>
        <div class="header-actions">
          <button class="header-btn" :class="{ active: isPreview }" @click="togglePreview">
            <span class="btn-icon">{{ isPreview ? '✏️' : '👁️' }}</span>
            {{ isPreview ? 'Edit Mode' : 'Preview Mode' }}
          </button>
          <button class="header-btn primary" @click="showExportModal = true">
            <span class="btn-icon">📤</span>
            Export
          </button>
          <button class="header-btn" @click="showHelp = true">
            <span class="btn-icon">❓</span>
            Help
          </button>
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="app-main">
      <SidebarTools v-if="!isPreview" class="sidebar" />
      
      <div class="canvas-container">
        <CanvasBuilder 
          :preview-mode="isPreview"
          @select-element="handleElementSelect"
        />
      </div>
      
      <PropertyEditor 
        v-if="!isPreview && selectedElement" 
        class="properties"
        :element="selectedElement"
        @update:element="handleElementUpdate"
        @delete:element="handleElementDelete"
      />
    </main>

    <!-- Export Modal -->
    <ExportModal 
      :show="showExportModal" 
      @close="showExportModal = false"
    />

    <!-- Help Modal -->
    <Teleport to="body">
      <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
        <div class="modal help-modal" @click.stop>
          <div class="modal-header">
            <h2>Welcome to Design Playground! 🎨</h2>
            <button class="close-btn" @click="showHelp = false">
              <span class="close-icon">×</span>
            </button>
          </div>
          <div class="modal-content">
            <div class="help-grid">
              <div class="help-card">
                <div class="help-icon">🖱️</div>
                <h3>Drag & Drop</h3>
                <p>Drag elements from sidebar to canvas to build your layout</p>
              </div>
              <div class="help-card">
                <div class="help-icon">🎯</div>
                <h3>Click to Select</h3>
                <p>Click on any element to select and edit its properties</p>
              </div>
              <div class="help-card">
                <div class="help-icon">⚡</div>
                <h3>Quick Edit</h3>
                <p>Double-click text elements to edit content directly</p>
              </div>
              <div class="help-card">
                <div class="help-icon">📤</div>
                <h3>Export</h3>
                <p>Export your design as HTML, React, or Vue code</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Quick Actions FAB -->
    <div class="fab-container">
      <button class="fab main-fab" @click="toggleFabMenu">
        <span class="fab-icon">⚡</span>
      </button>
      <div v-if="showFabMenu" class="fab-menu">
        <button class="fab-item" @click="addSampleLayout">
          <span class="fab-icon">🎨</span>
          <span class="fab-label">Add Sample</span>
        </button>
        <button class="fab-item" @click="clearAll">
          <span class="fab-icon">🗑️</span>
          <span class="fab-label">Clear All</span>
        </button>
        <button class="fab-item" @click="togglePreview">
          <span class="fab-icon">{{ isPreview ? '✏️' : '👁️' }}</span>
          <span class="fab-label">{{ isPreview ? 'Edit' : 'Preview' }}</span>
        </button>
      </div>
    </div>

    <!-- Status Bar -->
    <footer class="app-footer">
      <div class="status-bar">
        <div class="status-item">
          <span class="status-label">Elements:</span>
          <span class="status-value">{{ totalElements }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Sections:</span>
          <span class="status-value">{{ totalSections }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Selected:</span>
          <span class="status-value">{{ selectedElementType }}</span>
        </div>
      </div>
      <div class="action-bar">
        <button class="action-btn" @click="undo" :disabled="!canUndo">
          <span class="btn-icon">↶</span>
          Undo
        </button>
        <button class="action-btn" @click="redo" :disabled="!canRedo">
          <span class="btn-icon">↷</span>
          Redo
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from './stores/canvas'
import { useKeyboard } from './composables/useKeyboard'
import SidebarTools from './components/sidebar/SidebarTools.vue'
import CanvasBuilder from './components/canvas/CanvasBuilder.vue'
import PropertyEditor from './components/properties/PropertyEditor.vue'
import ExportModal from './components/modals/ExportModal.vue'

// Store
const store = useCanvasStore()

// State
const isPreview = ref(false)
const showExportModal = ref(false)
const showHelp = ref(false)
const showFabMenu = ref(false)
const selectedElement = ref(null)

// Computed
const totalElements = computed(() => store.totalElements)
const totalSections = computed(() => store.totalSections)
const canUndo = computed(() => store.canUndo)
const canRedo = computed(() => store.canRedo)
const selectedElementType = computed(() => {
  if (!selectedElement.value) return 'None'
  return selectedElement.value.type?.charAt(0).toUpperCase() + selectedElement.value.type?.slice(1)
})

// Methods
const togglePreview = () => {
  isPreview.value = !isPreview.value
  if (isPreview.value) {
    selectedElement.value = null
  }
}

const toggleFabMenu = () => {
  showFabMenu.value = !showFabMenu.value
}

const handleElementSelect = (element) => {
  selectedElement.value = element
}

const handleElementUpdate = (updatedElement) => {
  store.updateElement(updatedElement.id, updatedElement)
}

const handleElementDelete = (elementId) => {
  store.removeElement(elementId)
  selectedElement.value = null
}

const addSampleLayout = () => {
  store.addSampleLayout()
  showFabMenu.value = false
}

const clearAll = () => {
  if (confirm('Are you sure you want to clear everything? This cannot be undone.')) {
    store.clearCanvas()
    selectedElement.value = null
  }
  showFabMenu.value = false
}

const undo = () => {
  store.undo()
}

const redo = () => {
  store.redo()
}

// Keyboard shortcuts
useKeyboard([
  {
    key: 'Escape',
    action: () => {
      selectedElement.value = null
      store.selectElement(null)
    }
  },
  {
    key: 'Delete',
    action: () => {
      if (selectedElement.value) {
        handleElementDelete(selectedElement.value.id)
      }
    }
  },
  {
    key: 'z',
    ctrlKey: true,
    action: undo
  },
  {
    key: 'y',
    ctrlKey: true,
    action: redo
  },
  {
    key: 'e',
    ctrlKey: true,
    action: () => showExportModal.value = true
  },
  {
    key: 'p',
    ctrlKey: true,
    action: togglePreview
  }
])

// Initialize
onMounted(() => {
  store.initialize()
  
  // Show help on first visit
  const hasVisited = localStorage.getItem('design-playground-visited')
  if (!hasVisited) {
    showHelp.value = true
    localStorage.setItem('design-playground-visited', 'true')
  }
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

/* Header */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(45deg, #fff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.header-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.header-btn.primary {
  background: rgba(255, 255, 255, 0.2);
  border-color: #4ade80;
}

.header-btn.primary:hover {
  background: #4ade80;
  border-color: #4ade80;
}

/* Main Content */
.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #f8fafc;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  background: white;
}

.canvas-container {
  flex: 1;
  overflow: auto;
  background: #f8fafc;
  position: relative;
}

.properties {
  width: 320px;
  flex-shrink: 0;
  border-left: 1px solid #e2e8f0;
  background: white;
}

/* Help Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.help-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.4s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 32px 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #64748b;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-content {
  padding: 32px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.help-card {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.help-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.help-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.help-card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.help-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

/* FAB */
.fab-container {
  position: fixed;
  bottom: 100px;
  right: 32px;
  z-index: 90;
}

.main-fab {
  width: 64px;
  height: 64px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.4s ease;
}

.main-fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
}

.fab-menu {
  position: absolute;
  bottom: 80px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fabMenuSlide 0.3s ease;
}

.fab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border: none;
  background: white;
  color: #475569;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.fab-item:hover {
  background: #667eea;
  color: white;
  transform: translateX(-8px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

/* Footer */
.app-footer {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #64748b;
}

.status-bar {
  display: flex;
  gap: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.status-value {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  color: #475569;
  min-width: 40px;
  text-align: center;
}

.action-bar {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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

@keyframes fabMenuSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar,
  .properties {
    position: fixed;
    top: 64px;
    bottom: 60px;
    z-index: 50;
    background: white;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease;
  }
  
  .sidebar {
    left: 0;
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .properties {
    right: 0;
    transform: translateX(100%);
  }
  
  .properties.open {
    transform: translateX(0);
  }
  
  .help-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .header-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .app-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .status-bar {
    justify-content: space-between;
  }
  
  .fab-container {
    bottom: 80px;
    right: 16px;
  }
}

/* Preview Mode */
.preview-mode .sidebar,
.preview-mode .properties,
.preview-mode .fab-container,
.preview-mode .app-footer {
  display: none;
}

.preview-mode .canvas-container {
  margin: 0;
}
</style>