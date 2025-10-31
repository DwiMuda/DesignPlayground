<template>
  <div 
    class="widget" 
    :class="widgetClasses"
    :style="computedStyle"
    @click.stop="selectWidget"
    @dblclick.stop="handleDoubleClick"
    @contextmenu.prevent="handleContextMenu"
    ref="widgetRef"
  >
    <!-- Widget Content berdasarkan type -->
    <div class="widget-content">
      <template v-if="widget.type === 'text' || widget.type === 'paragraph'">
        <div class="text-content" :style="textStyle">
          {{ widget.text || widget.content || 'Text content' }}
        </div>
      </template>

      <template v-else-if="widget.type === 'button'">
        <button 
          class="button-element" 
          :style="buttonStyle"
          @click.stop="handleButtonClick"
        >
          {{ widget.text || 'Click me' }}
        </button>
      </template>

      <template v-else-if="widget.type === 'image'">
        <div class="image-container" :style="imageContainerStyle">
          <img 
            v-if="widget.src || widget.properties?.src"
            :src="widget.src || widget.properties?.src" 
            :alt="widget.properties?.alt || 'Image'"
            class="image-element"
            :style="imageStyle"
          />
          <div v-else class="image-placeholder">
            <span class="placeholder-icon">🖼️</span>
            <span class="placeholder-text">Image</span>
          </div>
        </div>
      </template>

      <template v-else-if="widget.type === 'input'">
        <input 
          type="text"
          class="input-element"
          :style="inputStyle"
          :placeholder="widget.properties?.placeholder || 'Enter text...'"
          :value="widget.text || ''"
          @input="handleInputChange"
          @click.stop
        />
      </template>

      <template v-else-if="widget.type === 'textarea'">
        <textarea 
          class="textarea-element"
          :style="textareaStyle"
          :placeholder="widget.properties?.placeholder || 'Enter your message...'"
          :rows="widget.properties?.rows || 4"
          :value="widget.text || ''"
          @input="handleTextareaChange"
          @click.stop
        ></textarea>
      </template>

      <template v-else-if="widget.type === 'heading'">
        <h2 class="heading-element" :style="headingStyle">
          {{ widget.text || 'Heading' }}
        </h2>
      </template>

      <template v-else-if="widget.type === 'card'">
        <div class="card-element" :style="cardStyle">
          <div class="card-header" v-if="widget.properties?.title">
            <h3 class="card-title">{{ widget.properties.title }}</h3>
          </div>
          <div class="card-body">
            {{ widget.text || widget.content || 'Card content goes here...' }}
          </div>
        </div>
      </template>

      <template v-else-if="widget.type === 'divider'">
        <hr class="divider-element" :style="dividerStyle" />
      </template>

      <template v-else-if="widget.type === 'link'">
        <a 
          class="link-element"
          :style="linkStyle"
          :href="widget.properties?.href || '#'"
          :target="widget.properties?.target || '_self'"
          @click.stop="handleLinkClick"
        >
          {{ widget.text || 'Click here' }}
        </a>
      </template>

      <template v-else-if="widget.type === 'container'">
        <div class="container-element" :style="containerStyle">
          <div class="container-content">
            {{ widget.text || widget.content || 'Container' }}
          </div>
        </div>
      </template>

      <template v-else-if="widget.type === 'icon'">
        <div class="icon-element" :style="iconStyle">
          <span class="icon-symbol">{{ widget.properties?.icon || '⭐' }}</span>
        </div>
      </template>

      <template v-else>
        <div class="unknown-element">
          <span class="unknown-icon">❓</span>
          <span class="unknown-text">{{ widget.type || 'Unknown' }}</span>
        </div>
      </template>
    </div>

    <!-- Selection Indicator -->
    <div v-if="isSelected" class="selection-indicator">
      <div class="selection-handles">
        <div 
          v-for="handle in resizeHandles" 
          :key="handle"
          class="resize-handle"
          :class="`handle-${handle}`"
          @mousedown.stop="startResize(handle, $event)"
        ></div>
      </div>
    </div>

    <!-- Widget Badge -->
    <div v-if="showWidgetBadge" class="widget-badge">
      {{ widgetTypeName }}
    </div>

    <!-- Context Menu -->
    <div 
      v-if="showContextMenu" 
      class="widget-context-menu"
      :style="contextMenuStyle"
      @mousedown.stop
    >
      <button @click="duplicateWidget" class="context-menu-item">
        <span class="menu-icon">📋</span>
        Duplicate
      </button>
      <button @click="editWidget" class="context-menu-item">
        <span class="menu-icon">✏️</span>
        Edit
      </button>
      <div class="menu-divider"></div>
      <button @click="deleteWidget" class="context-menu-item delete">
        <span class="menu-icon">🗑️</span>
        Delete
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from "../../stores/canvas"
import { useUIStore } from "../../stores/uiElements"
import { ELEMENT_NAMES, getElementName } from "../../utils/constants"

const props = defineProps({ 
  widget: Object,
  isSelected: {
    type: Boolean,
    default: false
  },
  showWidgetBadge: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'update', 'delete', 'duplicate'])

// Stores
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

// Refs
const widgetRef = ref(null)
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })

// Constants
const resizeHandles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

// Computed properties
const widgetClasses = computed(() => ({
  'widget': true,
  'selected': props.isSelected,
  [`widget-${props.widget.type}`]: true,
  'interactive': ['button', 'input', 'textarea', 'link'].includes(props.widget.type)
}))

const computedStyle = computed(() => {
  const baseStyle = {
    position: 'relative',
    cursor: 'pointer',
    ...props.widget.style
  }
  
  // Remove conflicting styles untuk inner elements
  const { padding, background, border, ...cleanStyle } = baseStyle
  return cleanStyle
})

const widgetTypeName = computed(() => {
  return getElementName(props.widget.type) || 'Widget'
})

// Style computed properties untuk different element types
const textStyle = computed(() => ({
  padding: props.widget.style?.padding || '12px 16px',
  color: props.widget.style?.color || '#333333',
  fontSize: props.widget.style?.fontSize || '16px',
  lineHeight: props.widget.style?.lineHeight || '1.5',
  backgroundColor: props.widget.style?.backgroundColor || 'transparent'
}))

const buttonStyle = computed(() => ({
  padding: props.widget.style?.padding || '12px 24px',
  backgroundColor: props.widget.style?.backgroundColor || '#007bff',
  color: props.widget.style?.color || '#ffffff',
  border: props.widget.style?.border || 'none',
  borderRadius: props.widget.style?.borderRadius || '6px',
  fontSize: props.widget.style?.fontSize || '14px',
  fontWeight: props.widget.style?.fontWeight || '600',
  cursor: 'pointer',
  width: '100%',
  height: '100%'
}))

const imageContainerStyle = computed(() => ({
  width: props.widget.style?.width || '200px',
  height: props.widget.style?.height || '150px',
  backgroundColor: props.widget.style?.backgroundColor || '#f8f9fa',
  border: props.widget.style?.border || '2px dashed #dee2e6',
  borderRadius: props.widget.style?.borderRadius || '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
}))

const imageStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: props.widget.style?.objectFit || 'cover',
  borderRadius: 'inherit'
}))

const inputStyle = computed(() => ({
  padding: props.widget.style?.padding || '10px 12px',
  border: props.widget.style?.border || '2px solid #e9ecef',
  borderRadius: props.widget.style?.borderRadius || '6px',
  fontSize: props.widget.style?.fontSize || '14px',
  backgroundColor: props.widget.style?.backgroundColor || '#ffffff',
  color: props.widget.style?.color || '#333333',
  width: '100%',
  outline: 'none'
}))

const textareaStyle = computed(() => ({
  padding: props.widget.style?.padding || '12px 16px',
  border: props.widget.style?.border || '2px solid #e9ecef',
  borderRadius: props.widget.style?.borderRadius || '6px',
  fontSize: props.widget.style?.fontSize || '14px',
  backgroundColor: props.widget.style?.backgroundColor || '#ffffff',
  color: props.widget.style?.color || '#333333',
  width: '100%',
  minHeight: props.widget.style?.minHeight || '100px',
  resize: 'vertical',
  outline: 'none',
  fontFamily: 'inherit'
}))

const headingStyle = computed(() => ({
  padding: props.widget.style?.padding || '16px 0',
  color: props.widget.style?.color || '#2c3e50',
  fontSize: props.widget.style?.fontSize || '24px',
  fontWeight: props.widget.style?.fontWeight || '700',
  lineHeight: props.widget.style?.lineHeight || '1.2',
  margin: '0'
}))

const cardStyle = computed(() => ({
  padding: props.widget.style?.padding || '24px',
  backgroundColor: props.widget.style?.backgroundColor || '#ffffff',
  color: props.widget.style?.color || '#333333',
  borderRadius: props.widget.style?.borderRadius || '12px',
  boxShadow: props.widget.style?.boxShadow || '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: props.widget.style?.border || '1px solid #f8f9fa'
}))

const dividerStyle = computed(() => ({
  height: props.widget.style?.height || '1px',
  backgroundColor: props.widget.style?.backgroundColor || '#e9ecef',
  border: props.widget.style?.border || 'none',
  margin: props.widget.style?.margin || '20px 0',
  width: '100%'
}))

const linkStyle = computed(() => ({
  padding: props.widget.style?.padding || '8px 0',
  color: props.widget.style?.color || '#007bff',
  fontSize: props.widget.style?.fontSize || '16px',
  textDecoration: props.widget.style?.textDecoration || 'underline',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  display: 'inline-block'
}))

const containerStyle = computed(() => ({
  padding: props.widget.style?.padding || '20px',
  backgroundColor: props.widget.style?.backgroundColor || '#f8f9fa',
  border: props.widget.style?.border || '1px solid #e9ecef',
  borderRadius: props.widget.style?.borderRadius || '8px',
  minHeight: props.widget.style?.minHeight || '100px'
}))

const iconStyle = computed(() => ({
  width: props.widget.style?.width || '40px',
  height: props.widget.style?.height || '40px',
  fontSize: props.widget.style?.fontSize || '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: props.widget.style?.backgroundColor || 'transparent'
}))

const contextMenuStyle = computed(() => ({
  left: `${contextMenuPosition.value.x}px`,
  top: `${contextMenuPosition.value.y}px`
}))

// Methods
const selectWidget = () => {
  emit('select', props.widget)
  canvasStore.selectElement(props.widget)
  console.log('🎯 Widget selected:', props.widget)
}

const handleDoubleClick = () => {
  console.log('🔄 Widget double-clicked:', props.widget)
  
  // Enter edit mode untuk text-based elements
  if (['text', 'heading', 'paragraph'].includes(props.widget.type)) {
    editWidget()
  }
}

const handleContextMenu = (event) => {
  event.preventDefault()
  showContextMenu.value = true
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  console.log('📋 Context menu opened for widget:', props.widget)
}

const handleButtonClick = (event) => {
  event.stopPropagation()
  console.log('🔘 Button clicked:', props.widget)
  // Bisa ditambahkan custom button action
}

const handleLinkClick = (event) => {
  event.stopPropagation()
  console.log('🔗 Link clicked:', props.widget)
  // Prevent default untuk demo, bisa di-disable di production
  event.preventDefault()
}

const handleInputChange = (event) => {
  emit('update', {
    ...props.widget,
    text: event.target.value
  })
  console.log('📝 Input changed:', event.target.value)
}

const handleTextareaChange = (event) => {
  emit('update', {
    ...props.widget,
    text: event.target.value
  })
  console.log('📝 Textarea changed:', event.target.value)
}

const startResize = (handle, event) => {
  event.stopPropagation()
  console.log('📐 Start resize:', handle)
  // Implement resize logic here
}

const duplicateWidget = () => {
  emit('duplicate', props.widget)
  showContextMenu.value = false
  console.log('📋 Widget duplicated:', props.widget)
}

const editWidget = () => {
  console.log('✏️ Edit widget:', props.widget)
  showContextMenu.value = false
  // Buka property editor atau inline editing
  uiStore.addNotification({
    type: 'info',
    title: 'Edit Mode',
    message: `Editing ${widgetTypeName.value}`
  })
}

const deleteWidget = () => {
  if (confirm(`Delete this ${widgetTypeName.value}?`)) {
    emit('delete', props.widget.id)
    showContextMenu.value = false
    console.log('🗑️ Widget deleted:', props.widget)
    
    uiStore.addNotification({
      type: 'success',
      title: 'Element Deleted',
      message: `${widgetTypeName.value} has been removed`
    })
  }
}

// Close context menu when clicking outside
const closeContextMenu = (event) => {
  if (showContextMenu.value && !widgetRef.value?.contains(event.target)) {
    showContextMenu.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeContextMenu)
  document.addEventListener('contextmenu', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
  document.removeEventListener('contextmenu', closeContextMenu)
})
</script>

<style scoped>
.widget {
  position: relative;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.widget:hover {
  outline: 2px dashed #007bff;
  outline-offset: 2px;
}

.widget.selected {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  z-index: 10;
}

/* Widget Content */
.widget-content {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Text Elements */
.text-content {
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* Button Element */
.button-element {
  transition: all 0.3s ease;
}

.button-element:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.button-element:active {
  transform: translateY(0);
}

/* Image Element */
.image-container {
  transition: all 0.3s ease;
}

.image-container:hover {
  border-color: #007bff;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6c757d;
}

.placeholder-icon {
  font-size: 24px;
}

.placeholder-text {
  font-size: 14px;
  font-weight: 500;
}

/* Input & Textarea Elements */
.input-element,
.textarea-element {
  transition: all 0.3s ease;
}

.input-element:focus,
.textarea-element:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Heading Element */
.heading-element {
  transition: color 0.2s ease;
}

/* Card Element */
.card-element {
  transition: all 0.3s ease;
}

.card-element:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  margin: 0;
  color: inherit;
  font-size: 18px;
  font-weight: 600;
}

.card-body {
  line-height: 1.5;
}

/* Divider Element */
.divider-element {
  transition: all 0.3s ease;
}

.divider-element:hover {
  background-color: #007bff;
}

/* Link Element */
.link-element {
  transition: all 0.2s ease;
  text-decoration: none;
}

.link-element:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Container Element */
.container-element {
  transition: all 0.3s ease;
}

.container-element:hover {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.container-content {
  text-align: center;
  color: #6c757d;
}

/* Icon Element */
.icon-element {
  transition: all 0.3s ease;
}

.icon-element:hover {
  transform: scale(1.1);
}

.icon-symbol {
  display: block;
}

/* Unknown Element */
.unknown-element {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  color: #6c757d;
}

.unknown-icon {
  font-size: 24px;
}

.unknown-text {
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

/* Selection Indicator */
.selection-indicator {
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

.selection-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007bff;
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: all;
  cursor: nwse-resize;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.handle-n { top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.handle-s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.handle-e { right: -4px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
.handle-w { left: -4px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.handle-ne { top: -4px; right: -4px; cursor: ne-resize; }
.handle-nw { top: -4px; left: -4px; cursor: nw-resize; }
.handle-se { bottom: -4px; right: -4px; cursor: se-resize; }
.handle-sw { bottom: -4px; left: -4px; cursor: sw-resize; }

/* Widget Badge */
.widget-badge {
  position: absolute;
  top: -18px;
  left: 0;
  background: #007bff;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  pointer-events: none;
  z-index: 5;
  white-space: nowrap;
  text-transform: capitalize;
}

/* Context Menu */
.widget-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 150px;
  padding: 6px;
  font-size: 13px;
  backdrop-filter: blur(10px);
}

.context-menu-item {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  transition: all 0.15s ease;
}

.context-menu-item:hover {
  background: #f8f9fa;
  color: #007bff;
}

.context-menu-item.delete:hover {
  background: #f8d7da;
  color: #dc3545;
}

.menu-icon {
  font-size: 12px;
}

.menu-divider {
  height: 1px;
  background: #e9ecef;
  margin: 4px 0;
}

/* Animations */
@keyframes pulse {
  0% { border-color: #007bff; }
  50% { border-color: #0056b3; }
  100% { border-color: #007bff; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .widget {
    margin-bottom: 6px;
  }
  
  .resize-handle {
    width: 12px;
    height: 12px;
  }
  
  .widget-badge {
    font-size: 9px;
    padding: 1px 4px;
  }
}
</style>