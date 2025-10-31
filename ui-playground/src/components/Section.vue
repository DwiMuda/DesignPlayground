<template>
  <div 
    class="section" 
    :style="sectionStyle"
    :class="{
      'section--empty': isEmpty,
      'section--selected': isSelected,
      'section--dragover': isDragOver,
      [`section--${section.layout}`]: true
    }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="handleSectionClick"
  >
    <!-- Section Header -->
    <div v-if="showHeader" class="section__header">
      <div class="section__info">
        <h3 v-if="section.title" class="section__title">
          {{ section.title }}
        </h3>
        <p v-if="section.description" class="section__description">
          {{ section.description }}
        </p>
      </div>
      
      <div class="section__actions">
        <button 
          v-if="showActions"
          class="section__action-btn section__action-btn--settings"
          @click.stop="handleSettingsClick"
          title="Section Settings"
        >
          ⚙️
        </button>
        <button 
          v-if="showActions"
          class="section__action-btn section__action-btn--delete"
          @click.stop="handleDeleteClick"
          title="Delete Section"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- Columns Container -->
    <div class="section__columns" :style="columnsContainerStyle">
      <Column 
        v-for="column in section.columns" 
        :key="column.id" 
        :column="column"
        :selected-widget-id="selectedWidgetId"
        @widget-select="handleWidgetSelect"
        @widget-edit="handleWidgetEdit"
        @widget-delete="handleWidgetDelete"
        @widget-drop="handleWidgetDrop"
      />
    </div>

    <!-- Empty State -->
    <div v-if="isEmpty" class="section__empty-state">
      <div class="empty-state__icon">📄</div>
      <h4 class="empty-state__title">Empty Section</h4>
      <p class="empty-state__description">
        Drag components here or add a new column
      </p>
      <button 
        class="empty-state__action-btn"
        @click.stop="handleAddColumn"
      >
        + Add Column
      </button>
    </div>

    <!-- Section Actions Footer -->
    <div v-if="showFooter && !isEmpty" class="section__footer">
      <button 
        class="section__add-column-btn"
        @click.stop="handleAddColumn"
      >
        + Add Column
      </button>
    </div>

    <!-- Drop Zone Overlay -->
    <div v-if="isDragOver" class="section__drop-overlay">
      <div class="drop-overlay__content">
        <span class="drop-icon">🎯</span>
        <p>Drop to add to section</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Column from './sidebar/Column.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  selectedWidgetId: {
    type: [String, Number],
    default: null
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'select', 
  'widget-select', 
  'widget-edit', 
  'widget-delete',
  'settings',
  'delete',
  'add-column',
  'drop',
  'widget-drop'
])

// Reactive state
const isDragOver = ref(false)

// Computed properties
const sectionStyle = computed(() => {
  const baseStyle = {
    background: props.section.background || '#ffffff',
    padding: props.section.padding || '24px',
    margin: props.section.margin || '0 0 24px 0',
    border: props.section.border || '2px solid transparent',
    borderRadius: props.section.borderRadius || '12px',
    ...props.section.style
  }

  return baseStyle
})

const columnsContainerStyle = computed(() => {
  const layout = props.section.layout || 'horizontal'
  
  const styles = {
    horizontal: {
      display: 'flex',
      gap: props.section.columnGap || '20px',
      alignItems: props.section.columnAlign || 'stretch'
    },
    vertical: {
      display: 'flex',
      flexDirection: 'column',
      gap: props.section.columnGap || '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${props.section.columns?.length || 1}, 1fr)`,
      gap: props.section.columnGap || '20px'
    }
  }

  return styles[layout] || styles.horizontal
})

const isEmpty = computed(() => {
  if (!props.section.columns || props.section.columns.length === 0) {
    return true
  }
  
  // Check if all columns are empty
  return props.section.columns.every(column => 
    !column.widgets || column.widgets.length === 0
  )
})

// Event handlers
const handleSectionClick = (event) => {
  // Only emit if clicking directly on the section (not on children)
  if (event.target === event.currentTarget) {
    emit('select', props.section)
  }
}

const handleWidgetSelect = (data) => {
  emit('widget-select', { 
    section: props.section, 
    widget: data.widget,
    column: data.column
  })
}

const handleWidgetEdit = (data) => {
  emit('widget-edit', { 
    section: props.section, 
    widget: data.widget,
    column: data.column
  })
}

const handleWidgetDelete = (data) => {
  emit('widget-delete', { 
    section: props.section, 
    widget: data.widget,
    column: data.column
  })
}

const handleWidgetDrop = (data) => {
  emit('widget-drop', {
    section: props.section,
    column: data.column,
    widgetData: data.widgetData,
    event: data.event
  })
}

const handleSettingsClick = () => {
  emit('settings', props.section)
}

const handleDeleteClick = () => {
  if (confirm('Are you sure you want to delete this section?')) {
    emit('delete', props.section)
  }
}

const handleAddColumn = () => {
  emit('add-column', props.section)
}

// Drag and drop handlers
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    emit('drop', { 
      section: props.section, 
      data, 
      event 
    })
  } catch (error) {
    console.warn('Invalid drop data:', error)
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
  event.dataTransfer.dropEffect = 'copy'
}

const handleDragLeave = (event) => {
  // Only set to false if leaving the section entirely
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragOver.value = false
  }
}
</script>

<style scoped>
.section {
  background: #ffffff;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.section:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section--selected {
  border-color: #3b82f6 !important;
  background: #f8fafc;
  box-shadow: 
    0 4px 25px rgba(59, 130, 246, 0.15),
    0 0 0 1px #3b82f6;
}

.section--dragover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.section--empty {
  border: 2px dashed #e2e8f0;
  background: #fafbfc;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Section Header */
.section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.section__info {
  flex: 1;
}

.section__title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.section__description {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.section__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.section__action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  background: transparent;
}

.section__action-btn:hover {
  transform: scale(1.1);
}

.section__action-btn--settings:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.section__action-btn--delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Columns Container */
.section__columns {
  min-height: 100px;
  position: relative;
}

/* Empty State */
.section__empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state__title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
}

.empty-state__description {
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state__action-btn {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-state__action-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Section Footer */
.section__footer {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.section__add-column-btn {
  padding: 10px 20px;
  background: transparent;
  color: #64748b;
  border: 1.5px dashed #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.section__add-column-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

/* Drop Zone Overlay */
.section__drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.05);
  border: 2px dashed #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.drop-overlay__content {
  text-align: center;
  color: #3b82f6;
}

.drop-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.drop-overlay__content p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

/* Layout Variants */
.section--vertical .section__columns {
  gap: 16px;
}

.section--grid .section__columns {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Responsive Design */
@media (max-width: 768px) {
  .section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .section__header {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .section__actions {
    align-self: flex-end;
  }

  .section__columns {
    flex-direction: column;
  }

  .section--grid .section__columns {
    grid-template-columns: 1fr;
  }
}

/* Animation */
@keyframes sectionHighlight {
  0% { 
    background-color: #eff6ff;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% { 
    background-color: #eff6ff;
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
  100% { 
    background-color: transparent;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.section--selected {
  animation: sectionHighlight 2s ease;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .section {
    background: #1e293b;
    border-color: #334155;
  }

  .section:hover {
    border-color: #475569;
  }

  .section--selected {
    background: #334155;
    border-color: #3b82f6;
  }

  .section--empty {
    background: #0f172a;
    border-color: #334155;
  }

  .section__title {
    color: #f1f5f9;
  }

  .section__description {
    color: #94a3b8;
  }

  .section__action-btn--settings:hover {
    background: #334155;
  }

  .empty-state__title {
    color: #e2e8f0;
  }

  .empty-state__description {
    color: #94a3b8;
  }

  .section__add-column-btn {
    background: #334155;
    color: #94a3b8;
    border-color: #475569;
  }

  .section__add-column-btn:hover {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
}
</style>