<template>
  <div class="property-editor" :class="{ empty: !selectedElement }">
    <!-- Header dengan Element Info -->
    <div class="property-header" v-if="selectedElement">
      <div class="header-main">
        <h3 class="editor-title">Properties</h3>
        <div class="element-info">
          <span class="element-type">{{ elementTypeName }}</span>
          <span class="element-id">#{{ selectedElement.id.slice(-6) }}</span>
        </div>
      </div>
    </div>

    <!-- Properties Content -->
    <div class="properties-content" v-if="selectedElement">
      <!-- Basic Properties Section -->
      <div class="property-section">
        <h4 class="section-title">Basic Properties</h4>
        
        <!-- Content Properties -->
        <div class="property-group" v-if="hasContentProperty">
          <label class="property-label">
            <span class="label-text">Content</span>
          </label>
          <textarea 
            v-model="selectedElement.text" 
            placeholder="Enter content..."
            rows="3"
            class="property-input"
            @input="handlePropertyChange"
          />
        </div>
      </div>

      <!-- Style Properties Section -->
      <div class="property-section">
        <h4 class="section-title">Style Properties</h4>
        
        <!-- Layout Properties -->
        <div class="property-row">
          <div class="property-group half">
            <label class="property-label">Width</label>
            <input 
              type="text"
              v-model="selectedElement.style.width" 
              placeholder="auto"
              class="property-input"
              @input="handleStyleChange"
            />
          </div>
          <div class="property-group half">
            <label class="property-label">Height</label>
            <input 
              type="text"
              v-model="selectedElement.style.height" 
              placeholder="auto"
              class="property-input"
              @input="handleStyleChange"
            />
          </div>
        </div>

        <!-- Color Properties -->
        <div class="property-row">
          <div class="property-group half">
            <label class="property-label">Background</label>
            <input 
              type="color"
              v-model="selectedElement.style.backgroundColor" 
              class="property-input"
              @input="handleStyleChange"
            />
          </div>
          <div class="property-group half">
            <label class="property-label">Text Color</label>
            <input 
              type="color"
              v-model="selectedElement.style.color" 
              class="property-input"
              @input="handleStyleChange"
            />
          </div>
        </div>

        <!-- Spacing Properties -->
        <div class="property-row">
          <div class="property-group half">
            <label class="property-label">Padding</label>
            <input 
              type="text"
              v-model="selectedElement.style.padding" 
              placeholder="10px"
              class="property-input"
              @input="handleStyleChange"
            />
          </div>
          <div class="property-group half">
            <label class="property-label">Margin</label>
            <input 
              type="text"
              v-model="selectedElement.style.margin" 
              placeholder="0"
              class="property-input"
              @input="handleStyleChange"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="property-actions-section">
        <button @click="deleteElement" class="action-btn danger">
          <span class="btn-icon">🗑️</span>
          Delete Element
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <div class="empty-content">
        <div class="empty-icon">⚙️</div>
        <h4 class="empty-title">No Element Selected</h4>
        <p class="empty-description">
          Select an element on the canvas to edit its properties
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCanvasStore } from '../../stores/canvas'
import { useUIStore } from '../../stores/uiElements'
import { getElementName } from '../../utils/constants'

const canvasStore = useCanvasStore()
const uiStore = useUIStore()

const { selectedElement, removeElement, updateElement } = canvasStore

// Computed properties
const elementTypeName = computed(() => {
  return getElementName(selectedElement.value?.type) || 'Element'
})

const hasContentProperty = computed(() => {
  const contentElements = ['text', 'button', 'heading', 'paragraph', 'link', 'card']
  return contentElements.includes(selectedElement.value?.type)
})

// Methods
const handlePropertyChange = () => {
  updateElement(selectedElement.value.id, {
    text: selectedElement.value.text
  })
}

const handleStyleChange = () => {
  updateElement(selectedElement.value.id, {
    style: { ...selectedElement.value.style }
  })
}

const deleteElement = () => {
  if (selectedElement.value && confirm(`Delete this ${elementTypeName.value}?`)) {
    removeElement(selectedElement.value.id)
    uiStore.addNotification({
      type: 'success',
      title: 'Element Deleted',
      message: `${elementTypeName.value} has been removed`
    })
  }
}
</script>

<style scoped>
.property-editor {
  width: 320px;
  background: white;
  border-left: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.property-editor.empty {
  justify-content: center;
}

/* Header */
.property-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.header-main {
  flex: 1;
}

.editor-title {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.element-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.element-type {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.element-id {
  color: #6c757d;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

/* Content */
.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}

/* Sections */
.property-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Property Groups */
.property-group {
  margin-bottom: 16px;
}

.property-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.property-row .property-group {
  flex: 1;
  margin-bottom: 0;
}

.property-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
  font-size: 13px;
}

/* Input Styles */
.property-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
  background: white;
}

.property-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.property-input[type="color"] {
  height: 40px;
  padding: 4px;
}

/* Action Buttons */
.property-actions-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn.danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.action-btn.danger:hover {
  background: #c82333;
}

.btn-icon {
  font-size: 12px;
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-content {
  max-width: 280px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-title {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.empty-description {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}
</style>