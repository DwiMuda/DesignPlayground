<template>
  <div
    class="component-item"
    :class="[
      `component-item--${variant}`,
      {
        'component-item--draggable': true,
        'component-item--interactive': true,
        'component-item--dragging': isDragging
      }
    ]"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <div class="component-item__preview">
      <div class="component-icon" :style="getIconStyle">
        {{ component.icon }}
      </div>
    </div>

    <div class="component-item__content">
      <div class="component-info">
        <h4 class="component-name">{{ component.name }}</h4>
        <p v-if="component.description && variant !== 'compact'" class="component-description">
          {{ component.description }}
        </p>
      </div>

      <div class="component-meta">
        <span class="component-type">{{ component.type }}</span>
        <span v-if="component.category" class="component-category">
          {{ component.category }}
        </span>
      </div>
    </div>

    <div class="component-item__actions">
      <button 
        class="action-btn action-btn--add"
        :title="`Add ${component.name} to canvas`"
        @click.stop="handleClick"
      >
        <span class="action-btn__icon">+</span>
        <span class="action-btn__text">Add</span>
      </button>
      
      <div class="drag-handle" title="Drag to add">
        ⋮⋮
      </div>
    </div>

    <div v-if="component.badge" class="component-badge">
      {{ component.badge }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true,
    validator: (comp) => {
      return comp.name && comp.type && comp.icon
    }
  },
  variant: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'compact', 'detailed'].includes(val)
  }
})

const emit = defineEmits(['add', 'drag-start', 'drag-end'])

// Reactive state
const isDragging = ref(false)

// Computed properties
const getIconStyle = computed(() => {
  // Default colors based on component type
  const typeColors = {
    text: { color: '#1e40af', bg: '#dbeafe' },
    button: { color: '#dc2626', bg: '#fecaca' },
    heading: { color: '#ea580c', bg: '#fed7aa' },
    paragraph: { color: '#65a30d', bg: '#d9f99d' },
    image: { color: '#7c3aed', bg: '#e9d5ff' },
    divider: { color: '#6b7280', bg: '#f3f4f6' },
    card: { color: '#059669', bg: '#a7f3d0' },
    input: { color: '#0d9488', bg: '#99f6e4' },
    textarea: { color: '#0891b2', bg: '#a5f3fc' },
    link: { color: '#db2777', bg: '#fbcfe8' },
    icon: { color: '#ca8a04', bg: '#fef08a' },
    container: { color: '#4f46e5', bg: '#c7d2fe' }
  }

  const colors = typeColors[props.component.type] || { color: '#3b82f6', bg: '#dbeafe' }

  return {
    color: props.component.iconColor || colors.color,
    backgroundColor: props.component.iconBg || colors.bg
  }
})

// Methods
const handleClick = (event) => {
  event.stopPropagation()
  emit('add', props.component)
}

const handleDragStart = (event) => {
  isDragging.value = true
  
  // Set drag data
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: 'component',
    data: props.component,
    timestamp: Date.now()
  }))
  event.dataTransfer.effectAllowed = 'copy'
  
  // Add visual feedback
  emit('drag-start', props.component)
}

const handleDragEnd = (event) => {
  isDragging.value = false
  emit('drag-end', props.component)
}
</script>

<style scoped>
.component-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1.5px solid #f1f5f9;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  user-select: none;
}

.component-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 
    0 4px 16px rgba(59, 130, 246, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.component-item:hover .action-btn--add {
  opacity: 1;
  transform: translateX(0);
}

.component-item:hover .drag-handle {
  opacity: 1;
}

.component-item:active {
  cursor: grabbing;
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 2px 8px rgba(59, 130, 246, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.component-item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.component-item--dragging {
  opacity: 0.6;
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 2px #3b82f6;
}

/* Preview Section */
.component-item__preview {
  flex-shrink: 0;
}

.component-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 20px;
  transition: transform 0.2s ease;
  font-weight: 500;
}

.component-item:hover .component-icon {
  transform: scale(1.05);
}

/* Content Section */
.component-item__content {
  flex: 1;
  min-width: 0;
}

.component-info {
  margin-bottom: 8px;
}

.component-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
  line-height: 1.4;
  margin: 0 0 4px 0;
}

.component-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Meta Information */
.component-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.component-type,
.component-category {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.component-type {
  background: #f1f5f9;
  color: #475569;
}

.component-category {
  background: #dbeafe;
  color: #1e40af;
}

/* Actions Section */
.component-item__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn--add {
  background: #3b82f6;
  color: white;
  opacity: 0;
  transform: translateX(8px);
}

.action-btn--add:hover {
  background: #2563eb;
  transform: translateX(0) scale(1.05);
}

.action-btn--add:active {
  transform: translateX(0) scale(0.95);
}

.action-btn__icon {
  font-size: 14px;
  font-weight: 600;
}

.action-btn__text {
  /* Hidden on mobile by default */
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #94a3b8;
  cursor: grab;
  opacity: 0;
  transition: all 0.2s ease;
  user-select: none;
  font-size: 12px;
  letter-spacing: 1px;
}

.drag-handle:hover {
  color: #64748b;
}

.component-item:active .drag-handle {
  cursor: grabbing;
}

/* Badge */
.component-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ========== VARIANTS ========== */

/* Compact Variant */
.component-item--compact {
  padding: 12px;
  gap: 12px;
}

.component-item--compact .component-icon {
  width: 40px;
  height: 40px;
  font-size: 18px;
}

.component-item--compact .component-name {
  font-size: 14px;
}

.component-item--compact .component-description {
  display: none;
}

.component-item--compact .action-btn__text {
  display: none;
}

/* Detailed Variant */
.component-item--detailed {
  flex-direction: column;
  align-items: stretch;
  text-align: center;
  gap: 12px;
}

.component-item--detailed .component-item__preview {
  align-self: center;
}

.component-item--detailed .component-meta {
  justify-content: center;
}

.component-item--detailed .component-item__actions {
  justify-content: center;
}

/* ========== RESPONSIVE DESIGN ========== */

@media (max-width: 768px) {
  .component-item {
    padding: 12px;
    gap: 12px;
  }

  .action-btn__text {
    display: none;
  }

  .component-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .component-name {
    font-size: 14px;
  }
}

/* Touch device support */
@media (hover: none) {
  .component-item .action-btn--add {
    opacity: 1;
    transform: translateX(0);
  }

  .component-item .drag-handle {
    opacity: 1;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .component-item {
    transition: none;
  }
  
  .component-item:hover {
    transform: none;
  }
  
  .component-icon {
    transition: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .component-item {
    background: #1e293b;
    border-color: #334155;
  }

  .component-item:hover {
    background: #1e293b;
    border-color: #3b82f6;
  }

  .component-name {
    color: #f1f5f9;
  }

  .component-description {
    color: #94a3b8;
  }

  .component-type {
    background: #334155;
    color: #cbd5e1;
  }
}
</style>