<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Export Design</h2>
        <button @click="close" class="close-btn">×</button>
      </div>

      <div class="export-options">
        <div class="option-group">
          <label>Format:</label>
          <select v-model="exportFormat">
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>

      <div class="preview-section">
        <h3>Preview</h3>
        <pre class="code-preview">{{ generatedCode }}</pre>
      </div>

      <div class="modal-actions">
        <button @click="copyToClipboard" class="btn btn-secondary">
          📋 Copy
        </button>
        <button @click="download" class="btn btn-primary">
          💾 Download
        </button>
        <button @click="close" class="btn btn-outline">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCanvasStore } from '../stores/canvas'

const props = defineProps({ 
  show: Boolean 
})
const emit = defineEmits(['close'])

const canvasStore = useCanvasStore()
const exportFormat = ref('html')

const generatedCode = computed(() => {
  const elements = canvasStore.allElements
  switch (exportFormat.value) {
    case 'html':
      return generateHTML(elements)
    case 'css':
      return generateCSS(elements)
    case 'json':
      return JSON.stringify({ sections: canvasStore.sections }, null, 2)
    default:
      return ''
  }
})

const generateHTML = (elements) => {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Exported Design</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .element { margin: 10px 0; }
    </style>
</head>
<body>
    ${elements.map(el => `<div class="element">${el.text || el.type}</div>`).join('\n    ')}
</body>
</html>`
}

const generateCSS = (elements) => {
  return `/* Design Styles */
.element {
    margin: 10px 0;
    padding: 10px;
}

/* Generated ${elements.length} elements */`
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    alert('Copied to clipboard!')
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

const download = () => {
  const blob = new Blob([generatedCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `design.${exportFormat.value}`
  a.click()
  URL.revokeObjectURL(url)
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.export-options {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-group label {
  font-weight: 500;
}

.option-group select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.preview-section {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.preview-section h3 {
  margin: 0 0 12px 0;
  color: #495057;
}

.code-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  max-height: 300px;
  overflow: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-outline {
  background: white;
  border: 1px solid #dee2e6;
  color: #495057;
}
</style>