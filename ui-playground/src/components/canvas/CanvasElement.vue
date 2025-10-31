<template>
  <div
    class="canvas-element"
    :class="[
      `element-${element.type}`,
      {
        selected: isSelected,
        dragging: isDragging,
        resizing: isResizing,
        rotating: isRotating,
        'drag-preview': isDragPreview,
        loading: isLoading,
        locked: element.locked
      }
    ]"
    :style="elementStyle"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu="handleContextMenu"
    @mousedown="handleMouseDown"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Selection Overlay -->
    <div v-if="isSelected" class="selection-overlay"></div>

    <!-- Element Badge -->
    <div v-if="showElementBadge && isSelected" class="element-badge">
      {{ elementTypeLabel }}
    </div>

    <!-- Rotation Handle -->
    <div 
      v-if="isSelected && showRotationHandle" 
      class="rotate-handle"
      @mousedown="startRotate"
      title="Rotate"
    >
      🔄
    </div>

    <!-- Resize Handles -->
    <template v-if="isSelected && showResizeHandles">
      <div class="resize-handle handle-n" @mousedown="startResize($event, 'n')"></div>
      <div class="resize-handle handle-s" @mousedown="startResize($event, 's')"></div>
      <div class="resize-handle handle-e" @mousedown="startResize($event, 'e')"></div>
      <div class="resize-handle handle-w" @mousedown="startResize($event, 'w')"></div>
      <div class="resize-handle handle-ne" @mousedown="startResize($event, 'ne')"></div>
      <div class="resize-handle handle-nw" @mousedown="startResize($event, 'nw')"></div>
      <div class="resize-handle handle-se" @mousedown="startResize($event, 'se')"></div>
      <div class="resize-handle handle-sw" @mousedown="startResize($event, 'sw')"></div>
    </template>

    <!-- Element Content -->
    <div class="element-content" :style="contentStyle">
      <!-- Widget content based on type -->
      <div v-if="element.type === 'text'" class="widget-text">
        {{ element.content || 'Text Element' }}
      </div>
      
      <div v-else-if="element.type === 'button'" class="widget-button">
        {{ element.content || 'Button' }}
      </div>
      
      <div v-else-if="element.type === 'heading'" class="widget-heading">
        {{ element.content || 'Heading' }}
      </div>
      
      <div v-else-if="element.type === 'paragraph'" class="widget-paragraph">
        {{ element.content || 'Paragraph text goes here...' }}
      </div>
      
      <div v-else-if="element.type === 'image'" class="widget-image">
        🖼️ Image
      </div>
      
      <div v-else-if="element.type === 'divider'" class="widget-divider"></div>
      
      <div v-else-if="element.type === 'card'" class="widget-card">
        <div class="card-content">
          {{ element.content || 'Card content' }}
        </div>
      </div>
      
      <div v-else-if="element.type === 'input'" class="widget-input">
        <input type="text" :placeholder="element.content || 'Input field'" readonly>
      </div>
      
      <div v-else-if="element.type === 'textarea'" class="widget-textarea">
        <textarea :placeholder="element.content || 'Textarea'" readonly></textarea>
      </div>
      
      <div v-else-if="element.type === 'link'" class="widget-link">
        {{ element.content || 'Link' }}
      </div>
      
      <div v-else-if="element.type === 'icon'" class="widget-icon">
        ⭐
      </div>
      
      <div v-else class="widget-default">
        {{ element.content || 'Element' }}
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="contextMenuStyle"
      v-click-outside="closeContextMenu"
    >
      <button class="menu-item" @click="handleDuplicate">
        <span>📋</span>
        Duplicate
      </button>
      <button class="menu-item" @click="handleCopy">
        <span>⎘</span>
        Copy
      </button>
      <div class="menu-divider"></div>
      <button class="menu-item" @click="handleBringToFront">
        <span>⬆️</span>
        Bring to Front
      </button>
      <button class="menu-item" @click="handleSendToBack">
        <span>⬇️</span>
        Send to Back
      </button>
      <div class="menu-divider"></div>
      <button class="menu-item" @click="handleLock">
        <span>{{ element.locked ? '🔓' : '🔒' }}</span>
        {{ element.locked ? 'Unlock' : 'Lock' }}
      </button>
      <button class="menu-item" @click="toggleVisibility">
        <span>{{ element.visible !== false ? '👁️' : '🙈' }}</span>
        {{ element.visible !== false ? 'Hide' : 'Show' }}
      </button>
      <div class="menu-divider"></div>
      <button class="menu-item delete" @click="handleDelete">
        <span>🗑️</span>
        Delete
      </button>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '../../stores/canvas'

// Props
const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  isResizing: {
    type: Boolean,
    default: false
  },
  isRotating: {
    type: Boolean,
    default: false
  },
  isDragPreview: {
    type: Boolean,
    default: false
  },
  showElementBadge: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'select',
  'update',
  'delete',
  'duplicate',
  'resize-start',
  'rotate-start',
  'drag-start'
])

// Stores
const canvasStore = useCanvasStore()

// Reactive state
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const isLoading = ref(false)

// Computed properties
const elementStyle = computed(() => {
  const baseStyle = {
    position: 'absolute',
    left: `${props.element.x || 0}px`,
    top: `${props.element.y || 0}px`,
    width: `${props.element.width || 100}px`,
    height: `${props.element.height || 40}px`,
    transform: `rotate(${props.element.rotation || 0}deg)`,
    zIndex: props.element.zIndex || 1,
    opacity: props.element.visible === false ? 0.5 : 1,
    cursor: getCursorType(),
    ...props.element.style
  }

  return baseStyle
})

const contentStyle = computed(() => {
  // Default styles for each element type
  const defaultStyles = {
    text: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#333333'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px'
    },
    heading: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    paragraph: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#4a5568'
    },
    image: {
      backgroundColor: '#f8f9fa',
      border: '2px dashed #dee2e6',
      borderRadius: '4px'
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  }

  return {
    ...defaultStyles[props.element.type],
    ...props.element.style
  }
})

const elementTypeLabel = computed(() => {
  const typeMap = {
    button: 'Button',
    text: 'Text',
    heading: 'Heading',
    paragraph: 'Paragraph',
    image: 'Image',
    input: 'Input',
    textarea: 'Textarea',
    card: 'Card',
    container: 'Container',
    section: 'Section',
    divider: 'Divider',
    link: 'Link',
    list: 'List',
    'list-item': 'List Item',
    icon: 'Icon'
  }
  return typeMap[props.element.type] || props.element.type
})

const showResizeHandles = computed(() => 
  props.isSelected && 
  !props.element.locked && 
  props.element.resizable !== false
)

const showRotationHandle = computed(() => 
  props.isSelected && 
  !props.element.locked && 
  props.element.rotatable !== false
)

const contextMenuStyle = computed(() => ({
  left: `${contextMenuPosition.value.x}px`,
  top: `${contextMenuPosition.value.y}px`
}))

// Methods
const getCursorType = () => {
  if (props.element.locked) return 'not-allowed'
  if (props.isDragging) return 'grabbing'
  if (props.isResizing) return getResizeCursor()
  if (props.isRotating) return 'grabbing'
  return 'move'
}

const getResizeCursor = () => {
  // This would be set based on the resize direction
  return 'nwse-resize'
}

const handleClick = (event) => {
  event.stopPropagation()
  if (!props.element.locked) {
    emit('select', props.element)
  }
}

const handleDoubleClick = (event) => {
  event.stopPropagation()
  if (!props.element.locked) {
    // Enter edit mode - could emit a separate event for editing
    emit('update', { ...props.element, editing: true })
  }
}

const handleContextMenu = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  showContextMenu.value = true
}

const handleMouseDown = (event) => {
  if (props.element.locked) return
  
  if (event.button === 0) { // Left click
    emit('drag-start', {
      event,
      element: props.element
    })
  }
}

const handleMouseEnter = () => {
  // Add hover effects
  if (!props.element.locked) {
    // Could add visual feedback
  }
}

const handleMouseLeave = () => {
  // Remove hover effects
}

const startResize = (event, direction) => {
  event.stopPropagation()
  if (props.element.locked) return
  
  emit('resize-start', {
    event,
    element: props.element,
    direction
  })
}

const startRotate = (event) => {
  event.stopPropagation()
  if (props.element.locked) return
  
  emit('rotate-start', {
    event,
    element: props.element
  })
}

const closeContextMenu = () => {
  showContextMenu.value = false
}

const handleDuplicate = () => {
  if (props.element.locked) return
  emit('duplicate', props.element)
  closeContextMenu()
}

const handleCopy = () => {
  if (props.element.locked) return
  // Implementation for copy
  console.log('Copy element:', props.element)
  closeContextMenu()
}

const handleDelete = () => {
  if (props.element.locked) return
  if (confirm(`Are you sure you want to delete this ${elementTypeLabel.value}?`)) {
    emit('delete', props.element.id)
  }
  closeContextMenu()
}

const handleBringToFront = () => {
  const updatedElement = {
    ...props.element,
    zIndex: (canvasStore.highestZIndex || 0) + 1
  }
  emit('update', updatedElement)
  closeContextMenu()
}

const handleSendToBack = () => {
  const updatedElement = {
    ...props.element,
    zIndex: 0
  }
  emit('update', updatedElement)
  closeContextMenu()
}

const handleLock = () => {
  const updatedElement = {
    ...props.element,
    locked: !props.element.locked
  }
  emit('update', updatedElement)
  closeContextMenu()
}

const toggleVisibility = () => {
  const updatedElement = {
    ...props.element,
    visible: props.element.visible !== false ? false : true
  }
  emit('update', updatedElement)
  closeContextMenu()
}

// Directives
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Lifecycle
onMounted(() => {
  console.log(`🎨 CanvasElement mounted: ${props.element.type}`)
})

onUnmounted(() => {
  // Cleanup
})
</script>

<style scoped>
.canvas-element {
  display: inline-block;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-sizing: border-box;
  min-width: 40px;
  min-height: 40px;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Hover States */
.canvas-element:hover {
  outline: 2px dashed #007bff;
  outline-offset: 2px;
}

.canvas-element.selected {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  z-index: 100;
}

.canvas-element.dragging {
  opacity: 0.85;
  cursor: grabbing !important;
  z-index: 1000 !important;
  transform: rotate(2deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.canvas-element.resizing {
  cursor: nwse-resize;
}

.canvas-element.rotating {
  cursor: grabbing;
}

.canvas-element.locked {
  cursor: not-allowed !important;
  opacity: 0.7;
}

.canvas-element.locked:hover {
  outline: 2px dashed #6c757d !important;
}

/* Element Content */
.element-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  transition: inherit;
}

/* Selection Overlay */
.selection-overlay {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  pointer-events: none;
  border: 2px solid #007bff;
  border-radius: 4px;
  animation: pulse 2s infinite;
  z-index: 5;
}

/* Resize Handles */
.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #007bff;
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: all;
  cursor: nwse-resize;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  transition: all 0.2s ease;
}

.resize-handle:hover {
  background: #0056b3;
  transform: scale(1.2);
}

.handle-n { top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.handle-s { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.handle-e { right: -6px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
.handle-w { left: -6px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.handle-ne { top: -6px; right: -6px; cursor: ne-resize; }
.handle-nw { top: -6px; left: -6px; cursor: nw-resize; }
.handle-se { bottom: -6px; right: -6px; cursor: se-resize; }
.handle-sw { bottom: -6px; left: -6px; cursor: sw-resize; }

/* Rotation Handle */
.rotate-handle {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: grab;
  pointer-events: all;
  user-select: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 10;
  transition: all 0.2s ease;
}

.rotate-handle:hover {
  background: #0056b3;
  transform: translateX(-50%) scale(1.1);
}

.rotate-handle:active {
  cursor: grabbing;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 180px;
  padding: 6px;
  font-size: 13px;
  backdrop-filter: blur(10px);
  animation: slideIn 0.2s ease-out;
}

.menu-item {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: #f8f9fa;
  color: #007bff;
}

.menu-item.delete:hover {
  background: #f8d7da;
  color: #dc3545;
}

.menu-divider {
  height: 1px;
  background: #e9ecef;
  margin: 4px 0;
}

/* Element Badge */
.element-badge {
  position: absolute;
  top: -20px;
  left: 0;
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  pointer-events: none;
  z-index: 5;
  white-space: nowrap;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ========== WIDGET SPECIFIC STYLES ========== */

.widget-text {
  width: 100%;
  height: 100%;
  padding: 8px 12px;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  display: flex;
  align-items: center;
}

.widget-button {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.widget-button:hover {
  background: #0056b3;
}

.widget-heading {
  width: 100%;
  height: 100%;
  padding: 12px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.widget-paragraph {
  width: 100%;
  height: 100%;
  padding: 12px;
  color: #4a5568;
  font-size: 16px;
  line-height: 1.6;
}

.widget-image {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border-radius: 4px;
  font-size: 14px;
}

.widget-divider {
  width: 100%;
  height: 2px;
  background: #e9ecef;
  margin: 20px 0;
}

.widget-card {
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.widget-input input {
  width: 100%;
  height: 100%;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  background: white;
  box-sizing: border-box;
}

.widget-textarea textarea {
  width: 100%;
  height: 100%;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  background: white;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
}

.widget-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
}

.widget-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.widget-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  font-size: 14px;
}

/* ========== ANIMATIONS ========== */

@keyframes pulse {
  0% {
    border-color: #007bff;
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  50% {
    border-color: #0056b3;
    box-shadow: 0 0 0 6px rgba(0, 123, 255, 0);
  }
  100% {
    border-color: #007bff;
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========== RESPONSIVE DESIGN ========== */

@media (max-width: 768px) {
  .canvas-element {
    min-width: 50px;
    min-height: 50px;
  }
  
  .resize-handle {
    width: 16px;
    height: 16px;
  }
  
  .rotate-handle {
    width: 28px;
    height: 28px;
    top: -40px;
    font-size: 14px;
  }
  
  .context-menu {
    min-width: 160px;
    font-size: 14px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .canvas-element.selected {
    outline: 3px solid #0000ff;
  }
  
  .resize-handle {
    border: 3px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .canvas-element {
    transition: none;
    animation: none;
  }
  
  .selection-overlay {
    animation: none;
  }
}
</style>