<template>
  <div class="sidebar-tools">
    <div class="sidebar-header">
      <h2 class="sidebar-title">Design Tools</h2>
      <p class="sidebar-subtitle">Build your layout</p>
    </div>
    
    <!-- Components Library -->
    <div class="tools-section">
      <h3 class="section-title">
        <span class="section-icon">🧩</span>
        Components
      </h3>
      <div class="components-grid">
        <div
          v-for="component in availableComponents"
          :key="component.type"
          class="component-item"
          draggable="true"
          @dragstart="handleComponentDragStart($event, component)"
          @dragend="handleDragEnd"
        >
          <div class="component-icon" :class="component.type">
            {{ component.icon }}
          </div>
          <div class="component-info">
            <span class="component-name">{{ component.name }}</span>
            <span class="component-category">{{ component.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout Sections -->
    <div class="tools-section">
      <h3 class="section-title">
        <span class="section-icon">📑</span>
        Sections
      </h3>
      <div class="sections-list">
        <div
          v-for="section in predefinedSections"
          :key="section.id"
          class="section-item"
          @click="handleAddSection(section)"
        >
          <div class="section-header">
            <div class="section-icon">
              {{ section.icon }}
            </div>
            <div class="section-info">
              <h4 class="section-name">{{ section.name }}</h4>
              <p class="section-description">{{ section.description }}</p>
            </div>
          </div>
          <div class="section-preview">
            <div 
              class="columns-preview"
              :class="`columns-${section.columns}`"
            >
              <div 
                v-for="n in section.columns" 
                :key="n"
                class="column-preview"
              ></div>
            </div>
          </div>
          <button class="add-section-btn">
            <span class="btn-icon">➕</span>
            Add
          </button>
        </div>
      </div>
    </div>

    <!-- Layout Columns -->
    <div class="tools-section">
      <h3 class="section-title">
        <span class="section-icon">📐</span>
        Layout
      </h3>
      <div class="columns-grid">
        <div
          v-for="column in columnLayouts"
          :key="column.id"
          class="column-layout"
          :class="column.id"
          @click="handleAddLayout(column)"
        >
          <div class="layout-preview">
            <div 
              v-for="n in column.columns" 
              :key="n"
              class="column"
              :class="{ 
                'sidebar': column.id === 'layout-sidebar' && n === 2, 
                'main': column.id === 'layout-sidebar' && n === 1,
                'wide': column.id === 'layout-asymmetric' && n <= 2
              }"
            ></div>
          </div>
          <div class="layout-info">
            <div class="layout-icon">{{ column.icon }}</div>
            <span class="layout-name">{{ column.name }}</span>
          </div>
          <button class="add-layout-btn" title="Add Layout">
            <span class="btn-icon">➕</span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Controls -->
    <div class="tools-section">
      <h3 class="section-title">
        <span class="section-icon">👁️</span>
        View Controls
      </h3>
      <div class="view-controls">
        <div class="control-group">
          <label class="control-label">Canvas View</label>
          <div class="control-buttons">
            <button 
              @click="$emit('toggle-grid')"
              class="control-btn"
              :class="{ active: showGrid }"
              title="Toggle Grid"
            >
              <span class="btn-icon">🎯</span>
              Grid
            </button>
            <button 
              @click="$emit('toggle-rulers')"
              class="control-btn"
              :class="{ active: showRulers }"
              title="Toggle Rulers"
            >
              <span class="btn-icon">📏</span>
              Rulers
            </button>
            <button 
              @click="$emit('toggle-outlines')"
              class="control-btn"
              :class="{ active: showOutlines }"
              title="Toggle Outlines"
            >
              <span class="btn-icon">📐</span>
              Outlines
            </button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Zoom</label>
          <div class="zoom-controls">
            <button 
              @click="$emit('zoom-out')"
              class="zoom-btn"
              :disabled="zoomLevel <= minZoom"
              title="Zoom Out"
            >
              <span class="btn-icon">−</span>
            </button>
            <div class="zoom-display">
              {{ Math.round(zoomLevel * 100) }}%
            </div>
            <button 
              @click="$emit('zoom-in')"
              class="zoom-btn"
              :disabled="zoomLevel >= maxZoom"
              title="Zoom In"
            >
              <span class="btn-icon">+</span>
            </button>
            <button 
              @click="$emit('reset-zoom')"
              class="zoom-btn"
              title="Reset Zoom"
            >
              <span class="btn-icon">⤢</span>
            </button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Snap to Grid</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="snap-toggle"
              v-model="snapToGrid"
              @change="handleSnapToggle"
              class="toggle-input"
            >
            <label for="snap-toggle" class="toggle-label">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="tools-section">
      <h3 class="section-title">
        <span class="section-icon">⚡</span>
        Quick Actions
      </h3>
      <div class="quick-actions">
        <button 
          @click="handleClearCanvas"
          class="action-btn danger"
          :disabled="!hasElements"
        >
          <span class="btn-icon">🗑️</span>
          Clear Canvas
        </button>
        <button 
          @click="handleExport"
          class="action-btn secondary"
        >
          <span class="btn-icon">📤</span>
          Export Design
        </button>
        <button 
          @click="handleSave"
          class="action-btn primary"
        >
          <span class="btn-icon">💾</span>
          Save
        </button>
      </div>
    </div>

    <!-- Canvas Stats -->
    <div class="tools-section">
      <h3 class="section-title">
        <span class="section-icon">📊</span>
        Statistics
      </h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ sectionsCount }}</div>
          <div class="stat-label">Sections</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ elementsCount }}</div>
          <div class="stat-label">Elements</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ selectedElement ? 1 : 0 }}</div>
          <div class="stat-label">Selected</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCanvasStore } from '../../stores/canvas'
import { useUIStore } from '../../stores/ui'

// Props
const props = defineProps({
  showGrid: {
    type: Boolean,
    default: false
  },
  showRulers: {
    type: Boolean,
    default: false
  },
  showOutlines: {
    type: Boolean,
    default: true
  },
  zoomLevel: {
    type: Number,
    default: 1
  }
})

// Emits
const emit = defineEmits([
  'toggle-grid',
  'toggle-rulers',
  'toggle-outlines',
  'zoom-in',
  'zoom-out',
  'reset-zoom',
  'add-section',
  'add-component',
  'clear-canvas',
  'export-design',
  'save-design'
])

// Stores
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

// Reactive state
const snapToGrid = ref(true)
const minZoom = 0.3
const maxZoom = 3

// Computed properties
const availableComponents = computed(() => [
  { type: 'text', name: 'Text', icon: '📝', category: 'basic' },
  { type: 'button', name: 'Button', icon: '🔘', category: 'basic' },
  { type: 'heading', name: 'Heading', icon: '🔤', category: 'basic' },
  { type: 'paragraph', name: 'Paragraph', icon: '📄', category: 'basic' },
  { type: 'image', name: 'Image', icon: '🖼️', category: 'media' },
  { type: 'divider', name: 'Divider', icon: '➖', category: 'layout' },
  { type: 'card', name: 'Card', icon: '🎴', category: 'layout' },
  { type: 'input', name: 'Input', icon: '📝', category: 'form' },
  { type: 'textarea', name: 'Textarea', icon: '📋', category: 'form' },
  { type: 'link', name: 'Link', icon: '🔗', category: 'basic' },
  { type: 'icon', name: 'Icon', icon: '⭐', category: 'basic' }
])

const predefinedSections = computed(() => [
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Full-width hero with title and CTA',
    columns: 1,
    icon: '🎯'
  },
  {
    id: 'features-section',
    name: 'Features Section',
    description: '3-column features layout',
    columns: 3,
    icon: '✨'
  },
  {
    id: 'content-section',
    name: 'Content Section',
    description: '2-column text and image',
    columns: 2,
    icon: '📄'
  },
  {
    id: 'footer-section',
    name: 'Footer Section',
    description: 'Multi-column footer layout',
    columns: 4,
    icon: '👣'
  }
])

const columnLayouts = computed(() => [
  { id: 'layout-1', columns: 1, icon: '▯', name: 'Single Column' },
  { id: 'layout-2', columns: 2, icon: '▯▯', name: 'Two Columns' },
  { id: 'layout-3', columns: 3, icon: '▯▯▯', name: 'Three Columns' },
  { id: 'layout-4', columns: 4, icon: '▯▯▯▯', name: 'Four Columns' },
  { id: 'layout-sidebar', columns: 2, icon: '▯▮', name: 'Sidebar Layout' },
  { id: 'layout-asymmetric', columns: 3, icon: '▯▯▮', name: 'Asymmetric' }
])

const sectionsCount = computed(() => canvasStore.sections?.length || 0)
const elementsCount = computed(() => canvasStore.totalElements || 0)
const selectedElement = computed(() => canvasStore.selectedElement)
const hasElements = computed(() => sectionsCount.value > 0 || elementsCount.value > 0)

// Methods
const handleComponentDragStart = (event, component) => {
  event.dataTransfer.setData('application/json', JSON.stringify(component))
  event.dataTransfer.effectAllowed = 'copy'
  event.target.classList.add('dragging')
  
  emit('add-component', component)
  console.log('🧩 Dragging component:', component.type)
}

const handleDragEnd = (event) => {
  event.target.classList.remove('dragging')
}

const handleAddSection = (section) => {
  console.log('📑 Adding section:', section)
  emit('add-section', section)
}

const handleAddLayout = (layout) => {
  console.log('📐 Adding layout:', layout)
  // Convert layout to section structure
  const newSection = {
    id: generateId(),
    columns: Array.from({ length: layout.columns }, (_, index) => ({
      id: generateId(),
      widgets: [],
      style: { flex: 1 }
    })),
    style: {
      padding: '40px 20px',
      background: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      marginBottom: '20px'
    }
  }
  emit('add-section', newSection)
}

const handleSnapToggle = () => {
  canvasStore.setSnapToGrid(snapToGrid.value)
  console.log('🧲 Snap to grid:', snapToGrid.value ? 'ON' : 'OFF')
}

const handleClearCanvas = () => {
  if (confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
    emit('clear-canvas')
  }
}

const handleExport = () => {
  console.log('📤 Opening export...')
  uiStore.toggleExportModal()
}

const handleSave = () => {
  console.log('💾 Saving design...')
  canvasStore.saveDesign()
  uiStore.addNotification({
    type: 'success',
    title: 'Design Saved',
    message: 'Your design has been saved successfully!'
  })
}

const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}
</script>

<style scoped>
.sidebar-tools {
  width: 300px;
  background: #f8fafc;
  padding: 20px;
  height: 100vh;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.sidebar-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Tools Sections */
.tools-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.section-icon {
  font-size: 1rem;
}

/* Components Grid */
.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.component-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.component-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.component-item.dragging {
  opacity: 0.6;
  border-color: #3b82f6;
  background: #eff6ff;
}

.component-icon {
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  flex-shrink: 0;
}

.component-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.component-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.component-category {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: capitalize;
}

/* Category-specific colors */
.component-item[data-type="text"] .component-icon {
  background: #dbeafe;
  color: #1e40af;
}

.component-item[data-type="button"] .component-icon {
  background: #fce7f3;
  color: #be185d;
}

.component-item[data-type="heading"] .component-icon {
  background: #fef3c7;
  color: #d97706;
}

.component-item[data-type="image"] .component-icon {
  background: #dcfce7;
  color: #166534;
}

.component-item[data-type="divider"] .component-icon {
  background: #f3f4f6;
  color: #374151;
}

.component-item[data-type="card"] .component-icon {
  background: #e0e7ff;
  color: #3730a3;
}

/* Sections List */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-item {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.section-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 6px;
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.section-preview {
  margin-bottom: 12px;
}

.columns-preview {
  display: flex;
  gap: 4px;
  height: 40px;
  background: #f8fafc;
  border-radius: 4px;
  padding: 4px;
}

.column-preview {
  flex: 1;
  background: #e2e8f0;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.section-item:hover .column-preview {
  background: #3b82f6;
  opacity: 0.7;
}

.add-section-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-section-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Columns Grid */
.columns-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.column-layout {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.column-layout:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.layout-preview {
  display: flex;
  gap: 3px;
  height: 60px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 4px;
  padding: 4px;
}

.column {
  flex: 1;
  background: #e2e8f0;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.column-layout:hover .column {
  background: #3b82f6;
  opacity: 0.7;
}

.layout-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layout-icon {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.layout-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.add-layout-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.625rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.column-layout:hover .add-layout-btn {
  opacity: 1;
}

.add-layout-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

/* View Controls */
.view-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.control-buttons {
  display: flex;
  gap: 4px;
}

.control-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.control-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.control-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Zoom Controls */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 4px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-display {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  min-width: 50px;
}

/* Toggle Switch */
.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-input:checked + .toggle-label {
  background: #3b82f6;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-label .toggle-slider {
  transform: translateX(20px);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  background: #dc2626;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 0.875rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Scrollbar styling */
.sidebar-tools::-webkit-scrollbar {
  width: 6px;
}

.sidebar-tools::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.sidebar-tools::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.sidebar-tools::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar-tools {
    width: 280px;
    padding: 16px;
  }
  
  .components-grid,
  .columns-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar-tools {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .tools-section {
    margin-bottom: 20px;
  }
  
  .components-grid,
  .columns-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .view-controls {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .control-group {
    flex: 1;
    min-width: 120px;
  }
}
</style>