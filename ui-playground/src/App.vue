<template>
  <div class="app" :class="appClasses">
    <!-- Sidebar Tools -->
    <SidebarTools 
      :class="{ 'sidebar--collapsed': uiStore.isSidebarCollapsed }"
    />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Simple Header -->
      <div class="simple-header">
        <div class="header-left">
          <button 
            class="header-btn"
            @click="uiStore.toggleSidebar"
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <h1 class="app-title">UI Playground</h1>
          <span class="widget-count" v-if="canvasStore.totalWidgets > 0">
            {{ canvasStore.totalWidgets }} widgets
          </span>
        </div>
        
        <div class="header-actions">
          <button 
            class="header-btn" 
            @click="handleSave" 
            title="Save (Ctrl+S)"
            :disabled="uiStore.isLoading"
          >
            💾
          </button>
          <button 
            class="header-btn" 
            @click="handleExport" 
            title="Export (Ctrl+E)"
          >
            📤
          </button>
          <button 
            class="header-btn" 
            @click="uiStore.togglePropertyPanel"
            title="Toggle Properties (Ctrl+P)"
          >
            ⚙️
          </button>
        </div>
      </div>
      
      <!-- Canvas Area -->
      <div class="canvas-container">
        <CanvasArea />
      </div>
    </div>

    <!-- Property Editor Panel -->
    <PropertyEditor 
      v-if="uiStore.showPropertyPanel"
      :class="{ 'properties--collapsed': !uiStore.showPropertyPanel }"
    />

    <!-- Export Modal -->
    <ExportModal 
      v-if="uiStore.showExportModal" 
      @close="uiStore.toggleExportModal"
    />

    <!-- Loading Overlay -->
    <div v-if="uiStore.isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">{{ uiStore.loadingMessage || 'Loading...' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from './stores/uiElements'
import { useCanvasStore } from './stores/canvas'
import SidebarTools from './components/sidebar/SidebarTools.vue'
import CanvasArea from './components/canvas/CanvasArea.vue'
import PropertyEditor from './components/properties/PropertyEditor.vue'
import ExportModal from './components/ExportModal.vue'

// Initialize stores
const uiStore = useUIStore()
const canvasStore = useCanvasStore()

// Computed properties
const appClasses = computed(() => ({
  'app--sidebar-collapsed': uiStore.isSidebarCollapsed,
  'app--properties-hidden': !uiStore.showPropertyPanel,
}))

// Keyboard shortcuts handler
const handleKeydown = (event) => {
  // Ctrl/Cmd + S - Save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    handleSave()
  }

  // Ctrl/Cmd + E - Export
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    handleExport()
  }

  // Ctrl/Cmd + P - Toggle property panel
  if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
    event.preventDefault()
    uiStore.togglePropertyPanel()
  }

  // Ctrl/Cmd + B - Toggle sidebar
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    uiStore.toggleSidebar()
  }

  // Escape - Close modals
  if (event.key === 'Escape') {
    if (uiStore.showExportModal) uiStore.toggleExportModal()
  }
}

// Event handlers
const handleExport = () => {
  uiStore.toggleExportModal()
}

const handleSave = () => {
  uiStore.setLoading(true, 'Saving changes...')
  
  // Simulate save operation
  setTimeout(() => {
    uiStore.setLoading(false)
    uiStore.addNotification({
      type: 'success',
      title: 'Saved Successfully',
      message: 'Your changes have been saved'
    })
  }, 1000)
}

// Lifecycle hooks
onMounted(() => {
  console.log('🚀 App mounted - initializing application')
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #eff6ff;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --radius-md: 8px;
  --radius-lg: 12px;
  --transition: all 0.3s ease;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  background-color: var(--bg-secondary);
}

.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

.app--sidebar-collapsed .sidebar {
  transform: translateX(-100%);
}

.app--sidebar-collapsed .main-content {
  margin-left: 0;
}

.app--properties-hidden .properties-panel {
  transform: translateX(100%);
}

.app--properties-hidden .main-content {
  margin-right: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  margin-left: 280px;
  margin-right: 320px;
  min-width: 0;
}

/* Simple Header */
.simple-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.widget-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 16px;
  transition: var(--transition);
}

.header-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

.header-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.canvas-container {
  flex: 1;
  display: flex;
  overflow: auto;
  background: var(--bg-primary);
}

/* Loading Overlay */
.loading-overlay {
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

.loading-spinner {
  text-align: center;
  background: var(--bg-primary);
  padding: 32px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .simple-header {
    padding: 8px 16px;
  }
  
  .app-title {
    font-size: 16px;
  }
  
  .header-btn {
    padding: 6px 10px;
    font-size: 14px;
  }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>