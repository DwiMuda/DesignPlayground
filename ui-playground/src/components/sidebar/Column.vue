<template>
  <div 
    class="column" 
    :style="columnStyle"
    :class="{ 
      'column-empty': !hasWidgets,
      'column-drag-over': isDragOver 
    }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="handleColumnClick"
  >
    <!-- Widgets in this column -->
    <div
      v-for="widget in column.widgets"
      :key="widget.id"
      class="widget"
      :class="{
        'widget-selected': isWidgetSelected(widget),
        [`widget-${widget.type}`]: true
      }"
      :style="getWidgetStyle(widget)"
      @click.stop="handleWidgetSelect(widget)"
      @dblclick.stop="handleWidgetEdit(widget)"
    >
      <!-- Render widget content based on type -->
      <div class="widget-content">
        <!-- Text Widget -->
        <div v-if="widget.type === 'text'" class="text-content">
          {{ widget.content || widget.text || 'Text content...' }}
        </div>

        <!-- Button Widget -->
        <div v-else-if="widget.type === 'button'" class="button-content">
          <button class="widget-button">
            {{ widget.content || widget.text || 'Click me' }}
          </button>
        </div>

        <!-- Heading Widget -->
        <div v-else-if="widget.type === 'heading'" class="heading-content">
          <h3>{{ widget.content || widget.text || 'Heading' }}</h3>
        </div>

        <!-- Paragraph Widget -->
        <div v-else-if="widget.type === 'paragraph'" class="paragraph-content">
          <p>{{ widget.content || widget.text || 'Paragraph text goes here...' }}</p>
        </div>

        <!-- Image Widget -->
        <div v-else-if="widget.type === 'image'" class="image-content">
          <div class="image-placeholder">
            <span class="image-icon">🖼️</span>
            <span class="image-text">Image</span>
          </div>
        </div>

        <!-- Divider Widget -->
        <div v-else-if="widget.type === 'divider'" class="divider-content">
          <hr class="widget-divider" />
        </div>

        <!-- Card Widget -->
        <div v-else-if="widget.type === 'card'" class="card-content">
          <div class="card">
            <div class="card-header">
              <h4>{{ widget.title || 'Card Title' }}</h4>
            </div>
            <div class="card-body">
              <p>{{ widget.content || widget.text || 'Card content...' }}</p>
            </div>
          </div>
        </div>

        <!-- Input Widget -->
        <div v-else-if="widget.type === 'input'" class="input-content">
          <input 
            type="text" 
            :placeholder="widget.placeholder || 'Enter text...'"
            class="widget-input"
            readonly
          />
        </div>

        <!-- Textarea Widget -->
        <div v-else-if="widget.type === 'textarea'" class="textarea-content">
          <textarea 
            :placeholder="widget.placeholder || 'Enter text...'"
            class="widget-textarea"
            readonly
          ></textarea>
        </div>

        <!-- Link Widget -->
        <div v-else-if="widget.type === 'link'" class="link-content">
          <a href="#" class="widget-link">
            {{ widget.content || widget.text || 'Link' }}
          </a>
        </div>

        <!-- Icon Widget -->
        <div v-else-if="widget.type === 'icon'" class="icon-content">
          <span class="widget-icon">⭐</span>
        </div>

        <!-- Default Widget -->
        <div v-else class="default-content">
          {{ widget.content || widget.text || 'Widget' }}
        </div>
      </div>

      <!-- Widget Actions -->
      <div v-if="isWidgetSelected(widget)" class="widget-actions">
        <button class="action-btn edit" @click.stop="handleWidgetEdit(widget)" title="Edit">
          ✏️
        </button>
        <button class="action-btn delete" @click.stop="handleWidgetDelete(widget)" title="Delete">
          🗑️
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!hasWidgets" class="empty-column">
      <div class="empty-content">
        <div class="empty-icon">📥</div>
        <p class="empty-text">Drop components here</p>
        <p class="empty-subtext">or drag from the sidebar</p>
      </div>
    </div>

    <!-- Drop Zone Indicator -->
    <div v-if="isDragOver" class="drop-zone-indicator">
      <div class="drop-zone-content">
        <span class="drop-icon">🎯</span>
        <p>Drop to add component</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  selectedWidgetId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits([
  'widget-select',
  'widget-edit', 
  'widget-delete',
  'column-select',
  'widget-drop'
])

// Reactive state
const isDragOver = ref(false)

// Computed properties
const columnStyle = computed(() => {
  return {
    flex: props.column.style?.flex || 1,
    minWidth: props.column.style?.minWidth || '200px',
    ...props.column.style
  }
})

const hasWidgets = computed(() => {
  return props.column.widgets && props.column.widgets.length > 0
})

// Methods
const isWidgetSelected = (widget) => {
  return widget.id === props.selectedWidgetId
}

const handleColumnClick = (event) => {
  // Only emit if clicking directly on the column (not on a widget)
  if (event.target === event.currentTarget) {
    emit('column-select', props.column)
  }
}

const handleWidgetSelect = (widget) => {
  emit('widget-select', { widget, column: props.column })
}

const handleWidgetEdit = (widget) => {
  emit('widget-edit', { widget, column: props.column })
}

const handleWidgetDelete = (widget) => {
  if (confirm(`Delete this ${widget.type}?`)) {
    emit('widget-delete', { widget, column: props.column })
  }
}

// Drag and Drop handlers
const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
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
    if (data) {
      const widgetData = JSON.parse(data)
      emit('widget-drop', {
        widgetData,
        column: props.column,
        event
      })
    }
  } catch (error) {
    console.error('Drop error:', error)
  }
}

// Style helpers
const getWidgetStyle = (widget) => {
  const baseStyle = {
    padding: widget.style?.padding || '12px',
    margin: widget.style?.margin || '0 0 16px 0',
    backgroundColor: widget.style?.backgroundColor || 'transparent',
    border: widget.style?.border || '1px solid transparent',
    borderRadius: widget.style?.borderRadius || '4px',
    ...widget.style
  }
  return baseStyle
}
</script>

<style scoped>
.column {
  min-height: 200px;
  padding: 16px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.3s ease;
  position: relative;
}

.column:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.column-drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
  border-style: solid;
}

/* Widget Styles */
.widget {
  position: relative;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 12px;
}

.widget:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.widget-selected {
  border-color: #3b82f6 !important;
  background: #eff6ff !important;
  box-shadow: 0 0 0 1px #3b82f6;
}

.widget-content {
  width: 100%;
  height: 100%;
}

/* Specific Widget Type Styles */
.text-content {
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.button-content .widget-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button-content .widget-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.heading-content h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.paragraph-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.image-content .image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  padding: 30px 20px;
  color: #6b7280;
}

.image-content .image-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.image-content .image-text {
  font-size: 14px;
  font-weight: 500;
}

.divider-content .widget-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
  width: 100%;
}

.card-content .card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-content .card-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.card-content .card-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.card-content .card-body {
  padding: 12px 16px;
}

.card-content .card-body p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.input-content .widget-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.textarea-content .widget-textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  resize: vertical;
  font-family: inherit;
}

.link-content .widget-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
}

.link-content .widget-link:hover {
  text-decoration: underline;
}

.icon-content .widget-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-content {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* Empty State */
.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.empty-content {
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-text {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.empty-subtext {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

/* Drop Zone Indicator */
.drop-zone-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.05);
  border: 2px dashed #3b82f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.drop-zone-content {
  text-align: center;
  color: #3b82f6;
}

.drop-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.drop-zone-content p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

/* Widget Actions */
.widget-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.widget:hover .widget-actions,
.widget-selected .widget-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: #3b82f6;
  color: white;
}

.action-btn.edit:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.action-btn.delete {
  background: #ef4444;
  color: white;
}

.action-btn.delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}
</style>