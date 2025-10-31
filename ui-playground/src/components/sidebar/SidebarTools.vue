<template>
  <div class="sidebar-tools">
    <!-- Header -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">Design Tools</h2>
      <p class="sidebar-subtitle">Drag elements to canvas</p>
    </div>

    <!-- Basic Elements -->
    <div class="tools-section">
      <div class="section-header">
        <h3 class="section-title">Basic Elements</h3>
        <div class="section-badge">{{ basicElements.length }}</div>
      </div>
      <div class="elements-grid">
        <div
          v-for="element in basicElements"
          :key="element.type"
          class="element-item"
          draggable="true"
          @dragstart="handleDragStart($event, element)"
          @click="addElement(element)"
        >
          <div class="element-icon">{{ element.icon }}</div>
          <div class="element-info">
            <div class="element-name">{{ element.name }}</div>
            <div class="element-description">{{ element.description }}</div>
          </div>
          <div class="element-action">
            <button class="add-btn" title="Add to canvas">
              <span class="add-icon">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout Sections -->
    <div class="tools-section">
      <div class="section-header">
        <h3 class="section-title">Layout Sections</h3>
        <div class="section-badge">{{ layoutTemplates.length }}</div>
      </div>
      <div class="layouts-grid">
        <div
          v-for="template in layoutTemplates"
          :key="template.id"
          class="layout-item"
          @click="addSection(template)"
        >
          <div class="layout-preview">
            <div 
              v-for="col in template.columns" 
              :key="col"
              class="layout-column"
              :style="{ flex: col.flex }"
            ></div>
          </div>
          <div class="layout-info">
            <div class="layout-name">{{ template.name }}</div>
            <div class="layout-columns">{{ template.columns.length }} column{{ template.columns.length > 1 ? 's' : '' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="tools-section quick-actions">
      <div class="section-header">
        <h3 class="section-title">Quick Actions</h3>
      </div>
      <div class="actions-grid">
        <button class="action-btn add-sample" @click="addSampleLayout">
          <span class="action-icon">🎨</span>
          Add Sample Layout
        </button>
        <button class="action-btn clear-all" @click="clearCanvas">
          <span class="action-icon">🗑️</span>
          Clear Canvas
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="sidebar-stats">
      <div class="stat-item">
        <div class="stat-value">{{ totalElements }}</div>
        <div class="stat-label">Elements</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ totalSections }}</div>
        <div class="stat-label">Sections</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCanvasStore } from '../../stores/canvas'
import { ELEMENT_TYPES, DEFAULT_STYLES, ELEMENT_ICONS, ELEMENT_NAMES } from '../../utils/constants'

const store = useCanvasStore()

// Basic elements configuration
const basicElements = [
  {
    type: ELEMENT_TYPES.TEXT,
    name: ELEMENT_NAMES[ELEMENT_TYPES.TEXT],
    icon: ELEMENT_ICONS[ELEMENT_TYPES.TEXT],
    description: 'Text content element',
    defaultText: 'Sample Text',
    defaultStyle: DEFAULT_STYLES[ELEMENT_TYPES.TEXT]
  },
  {
    type: ELEMENT_TYPES.BUTTON,
    name: ELEMENT_NAMES[ELEMENT_TYPES.BUTTON],
    icon: ELEMENT_ICONS[ELEMENT_TYPES.BUTTON],
    description: 'Interactive button',
    defaultText: 'Click Me',
    defaultStyle: DEFAULT_STYLES[ELEMENT_TYPES.BUTTON]
  },
  {
    type: ELEMENT_TYPES.IMAGE,
    name: ELEMENT_NAMES[ELEMENT_TYPES.IMAGE],
    icon: ELEMENT_ICONS[ELEMENT_TYPES.IMAGE],
    description: 'Image element',
    defaultSrc: 'https://via.placeholder.com/200x150/3498db/ffffff?text=Image',
    defaultStyle: DEFAULT_STYLES[ELEMENT_TYPES.IMAGE]
  },
  {
    type: ELEMENT_TYPES.CARD,
    name: ELEMENT_NAMES[ELEMENT_TYPES.CARD],
    icon: ELEMENT_ICONS[ELEMENT_TYPES.CARD],
    description: 'Container with shadow',
    defaultText: 'Card Content',
    defaultStyle: DEFAULT_STYLES[ELEMENT_TYPES.CARD]
  },
  {
    type: ELEMENT_TYPES.INPUT,
    name: ELEMENT_NAMES[ELEMENT_TYPES.INPUT],
    icon: ELEMENT_ICONS[ELEMENT_TYPES.INPUT],
    description: 'Text input field',
    defaultText: '',
    defaultStyle: DEFAULT_STYLES[ELEMENT_TYPES.INPUT]
  },
  {
    type: ELEMENT_TYPES.TEXTAREA,
    name: ELEMENT_NAMES[ELEMENT_TYPES.TEXTAREA],
    icon: ELEMENT_ICONS[ELEMENT_TYPES.TEXTAREA],
    description: 'Multi-line text input',
    defaultText: '',
    defaultStyle: DEFAULT_STYLES[ELEMENT_TYPES.TEXTAREA]
  }
]

// Layout templates
const layoutTemplates = [
  {
    id: 'single-column',
    name: 'Single Column',
    columns: [{ flex: '1' }]
  },
  {
    id: 'two-equal',
    name: 'Two Columns',
    columns: [{ flex: '1' }, { flex: '1' }]
  },
  {
    id: 'three-equal',
    name: 'Three Columns',
    columns: [{ flex: '1' }, { flex: '1' }, { flex: '1' }]
  },
  {
    id: 'sidebar-layout',
    name: 'Sidebar Layout',
    columns: [{ flex: '1' }, { flex: '3' }]
  }
]

// Computed
const totalElements = computed(() => store.totalElements)
const totalSections = computed(() => store.totalSections)

// Methods
const handleDragStart = (event, element) => {
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: element.type,
    text: element.defaultText,
    src: element.defaultSrc || '',
    style: { ...element.defaultStyle }
  }))
  event.dataTransfer.effectAllowed = 'copy'
}

const addElement = (element) => {
  store.addElement({
    type: element.type,
    text: element.defaultText,
    src: element.defaultSrc || '',
    style: { ...element.defaultStyle },
    position: { x: 100, y: 100 + (store.totalElements * 10) }
  })
}

const addSection = (template) => {
  const section = store.addElement({
    type: ELEMENT_TYPES.SECTION,
    style: { ...DEFAULT_STYLES[ELEMENT_TYPES.SECTION] },
    position: { x: 50, y: 50 + (store.totalSections * 60) },
    children: template.columns.map((col, index) => ({
      type: ELEMENT_TYPES.CARD,
      text: `Column ${index + 1}`,
      style: { 
        ...DEFAULT_STYLES[ELEMENT_TYPES.CARD],
        flex: col.flex,
        margin: '10px'
      }
    }))
  })
}

const addSampleLayout = () => {
  store.addSampleLayout()
}

const clearCanvas = () => {
  if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
    store.clearCanvas()
  }
}
</script>

<style scoped>
.sidebar-tools {
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.sidebar-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
}

.sidebar-subtitle {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.tools-section {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.tools-section:last-of-type {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-badge {
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

/* Elements Grid */
.elements-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.3s ease;
  position: relative;
}

.element-item:hover {
  border-color: #667eea;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.element-item:hover .add-btn {
  opacity: 1;
  transform: scale(1);
}

.element-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.element-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.element-item:hover .element-icon {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.element-info {
  flex: 1;
  min-width: 0;
}

.element-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  margin-bottom: 2px;
}

.element-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.3;
}

.element-action .add-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.element-action .add-btn .add-icon {
  font-size: 16px;
  font-weight: 700;
}

.element-action .add-btn:hover {
  background: #5a67d8;
  transform: scale(1.1);
}

/* Layouts Grid */
.layouts-grid {
  display: grid;
  gap: 12px;
}

.layout-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.layout-item:hover {
  border-color: #667eea;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.layout-preview {
  display: flex;
  gap: 2px;
  width: 60px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  flex-shrink: 0;
}

.layout-column {
  background: #667eea;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.layout-item:hover .layout-column {
  opacity: 0.9;
  transform: scale(1.05);
}

.layout-info {
  flex: 1;
}

.layout-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  margin-bottom: 2px;
}

.layout-columns {
  font-size: 12px;
  color: #64748b;
}

/* Quick Actions */
.quick-actions {
  border-bottom: none;
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.action-btn:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.add-sample:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-btn.clear-all:hover {
  border-color: #e53e3e;
  color: #e53e3e;
}

.action-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* Stats */
.sidebar-stats {
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 20px;
  background: #f8fafc;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Scrollbar */
.sidebar-tools::-webkit-scrollbar {
  width: 4px;
}

.sidebar-tools::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.sidebar-tools::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.sidebar-tools::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .elements-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .element-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .element-info {
    text-align: center;
  }
}
</style>