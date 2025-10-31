<template>
    <Teleport to="body">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <div class="modal">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <h2>Export Design</h2>
              <p class="subtitle">Export your design in various formats</p>
            </div>
            <button class="close-btn" @click="close">
              <span class="close-icon">×</span>
            </button>
          </div>
  
          <!-- Export Tabs -->
          <div class="export-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
  
          <!-- Options -->
          <div class="tab-content">
            <div class="options-grid">
              <!-- HTML Options -->
              <div v-if="activeTab === 'html'" class="option-card">
                <label class="option-title">CSS Output</label>
                <select v-model="htmlOptions.cssOutput" class="select-input">
                  <option value="inline">Inline Styles</option>
                  <option value="external">External CSS</option>
                </select>
              </div>
  
              <!-- React Options -->
              <div v-if="activeTab === 'react'" class="option-card">
                <label class="option-title">Style Method</label>
                <select v-model="reactOptions.styleMethod" class="select-input">
                  <option value="inline">Inline Styles</option>
                  <option value="cssmodules">CSS Modules</option>
                </select>
              </div>
  
              <!-- Vue Options -->
              <div v-if="activeTab === 'vue'" class="option-card">
                <label class="option-title">API Style</label>
                <select v-model="vueOptions.apiStyle" class="select-input">
                  <option value="composition">Composition API</option>
                  <option value="options">Options API</option>
                </select>
              </div>
            </div>
          </div>
  
          <!-- Code Preview -->
          <div class="code-preview-section">
            <div class="preview-header">
              <span class="preview-title">Code Preview</span>
              <div class="preview-actions">
                <button class="action-btn secondary" @click="refreshCode">
                  ↻ Refresh
                </button>
                <button class="action-btn primary" @click="copyToClipboard" :disabled="copied">
                  {{ copied ? '✓ Copied!' : '📋 Copy' }}
                </button>
                <button class="action-btn success" @click="downloadFile">
                  ⬇ Download
                </button>
              </div>
            </div>
            
            <div class="code-container">
              <pre class="code-content"><code>{{ generatedCode }}</code></pre>
              <div class="code-stats">
                <span class="stat">{{ codeLines }} lines</span>
                <span class="stat">{{ codeSize }} KB</span>
                <span class="stat">{{ elementsCount }} elements</span>
              </div>
            </div>
          </div>
  
          <!-- Success Message -->
          <div v-if="copied" class="success-message">
            ✓ Code successfully copied to clipboard!
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useCanvasStore } from '@/stores/canvas'
  
  // Props & Emits
  const props = defineProps({
    show: Boolean
  })
  
  const emit = defineEmits(['close'])
  
  // Store
  const store = useCanvasStore()
  const { elements } = store
  
  // Reactive state
  const copied = ref(false)
  const activeTab = ref('html')
  
  // Tabs
  const tabs = [
    { id: 'html', label: 'HTML' },
    { id: 'react', label: 'React' },
    { id: 'vue', label: 'Vue' }
  ]
  
  // Options
  const htmlOptions = ref({
    cssOutput: 'inline'
  })
  
  const reactOptions = ref({
    styleMethod: 'inline'
  })
  
  const vueOptions = ref({
    apiStyle: 'composition'
  })
  
  // Computed properties
  const generatedCode = computed(() => {
    if (!elements.length) {
      return '// No elements to export\n// Add some elements to the canvas first'
    }
  
    switch (activeTab.value) {
      case 'html':
        return generateHTML()
      case 'react':
        return generateReact()
      case 'vue':
        return generateVue()
      default:
        return generateHTML()
    }
  })
  
  const codeLines = computed(() => generatedCode.value.split('\n').length)
  const codeSize = computed(() => (new Blob([generatedCode.value]).size / 1024).toFixed(2))
  const elementsCount = computed(() => elements.length)
  
  // Code Generation
  const generateHTML = () => {
    const elementsHTML = elements.map(el => {
      const styleStr = objectToStyleString(el.style)
      
      switch (el.type) {
        case 'button':
          return `  <button style="${styleStr}">${el.text || 'Button'}</button>`
        case 'input':
          return `  <input style="${styleStr}" placeholder="${el.text || 'Input'}" />`
        default:
          return `  <div style="${styleStr}">${el.text || 'Element'}</div>`
      }
    }).join('\n')
  
    if (htmlOptions.value.cssOutput === 'external') {
      return `<!DOCTYPE html>
  <html>
  <head>
    <style>
      .container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 20px;
      }
      ${generateExternalCSS()}
    </style>
  </head>
  <body>
    <div class="container">
  ${elementsHTML}
    </div>
  </body>
  </html>`
    }
  
    return `<!DOCTYPE html>
  <html>
  <head>
    <style>
      .container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
  ${elementsHTML}
    </div>
  </body>
  </html>`
  }
  
  const generateReact = () => {
    const elementsJSX = elements.map(el => {
      const style = reactOptions.value.styleMethod === 'inline' 
        ? `style={${JSON.stringify(convertStyleForJS(el.style))}}`
        : ''
  
      switch (el.type) {
        case 'button':
          return `    <button ${style}>${el.text || 'Button'}</button>`
        case 'input':
          return `    <input ${style} placeholder="${el.text || 'Input'}" />`
        default:
          return `    <div ${style}>${el.text || 'Element'}</div>`
      }
    }).join('\n')
  
    return `import React from 'react';
  
  const MyComponent = () => {
    return (
      <div className="container">
  ${elementsJSX}
      </div>
    );
  };
  
  export default MyComponent;`
  }
  
  const generateVue = () => {
    const elementsTemplate = elements.map(el => {
      const style = `:style="${JSON.stringify(convertStyleForJS(el.style))}"`
  
      switch (el.type) {
        case 'button':
          return `    <button ${style}>${el.text || 'Button'}</button>`
        case 'input':
          return `    <input ${style} placeholder="${el.text || 'Input'}" />`
        default:
          return `    <div ${style}>${el.text || 'Element'}</div>`
      }
    }).join('\n')
  
    if (vueOptions.value.apiStyle === 'composition') {
      return `<template>
    <div class="container">
  ${elementsTemplate}
    </div>
  </template>
  
  <script setup>
  // Composition API
  </script>
  
  <style scoped>
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px;
  }
  </style>`
    } else {
      return `<template>
    <div class="container">
  ${elementsTemplate}
    </div>
  </template>
  
  <script>
  export default {
    name: 'MyComponent'
  }
  </script>
  
  <style scoped>
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px;
  }
  </style>`
    }
  }
  
  // Utility functions
  const objectToStyleString = (styleObj) => {
    return Object.entries(styleObj || {})
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join(' ')
  }
  
  const convertStyleForJS = (styleObj) => {
    const result = {}
    Object.entries(styleObj || {}).forEach(([key, value]) => {
      const jsKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      result[jsKey] = value
    })
    return result
  }
  
  const generateExternalCSS = () => {
    return elements.map((el, index) => 
      `.element-${index} { ${objectToStyleString(el.style)} }`
    ).join('\n    ')
  }
  
  // Actions
  const refreshCode = () => {
    // Force refresh by accessing computed property
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode.value)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = generatedCode.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  }
  
  const downloadFile = () => {
    const blob = new Blob([generatedCode.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    
    let extension = 'html'
    if (activeTab.value === 'react') extension = 'jsx'
    if (activeTab.value === 'vue') extension = 'vue'
    
    a.href = url
    a.download = `design-export.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const close = () => {
    emit('close')
  }
  
  // Reset when modal closes
  watch(() => props.show, (newVal) => {
    if (!newVal) {
      copied.value = false
    }
  })
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
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .header-content h2 {
    margin: 0 0 5px 0;
    font-size: 1.5rem;
  }
  
  .subtitle {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
    color: #666;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .export-tabs {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .tab-btn {
    padding: 12px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  
  .tab-btn.active {
    border-bottom-color: #007bff;
    color: #007bff;
  }
  
  .tab-content {
    padding: 20px;
  }
  
  .options-grid {
    display: grid;
    gap: 15px;
  }
  
  .option-card {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .option-title {
    font-weight: 600;
    color: #333;
  }
  
  .select-input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .code-preview-section {
    padding: 0 20px 20px;
  }
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .preview-title {
    font-weight: 600;
    color: #333;
  }
  
  .preview-actions {
    display: flex;
    gap: 10px;
  }
  
  .action-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .action-btn.secondary {
    background: white;
    color: #333;
  }
  
  .action-btn.primary {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .action-btn.success {
    background: #28a745;
    color: white;
    border-color: #28a745;
  }
  
  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .code-container {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .code-content {
    background: #f8f8f8;
    padding: 20px;
    margin: 0;
    overflow: auto;
    max-height: 300px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
  }
  
  .code-stats {
    display: flex;
    gap: 15px;
    padding: 10px 20px;
    background: #f0f0f0;
    border-top: 1px solid #e0e0e0;
    font-size: 12px;
    color: #666;
  }
  
  .stat {
    display: flex;
    align-items: center;
  }
  
  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 12px 20px;
    margin: 0 20px 20px;
    border-radius: 4px;
    border: 1px solid #c3e6cb;
  }
  
  @media (max-width: 768px) {
    .modal {
      width: 95%;
      margin: 10px;
    }
    
    .preview-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
    
    .preview-actions {
      width: 100%;
      justify-content: space-between;
    }
  }
  </style>