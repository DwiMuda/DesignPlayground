<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">Components</h2>
      <p class="sidebar-subtitle">Drag & drop or click to add</p>
    </div>

    <!-- Components Library -->
    <div class="components-section">
      <div class="section-title">Basic Elements</div>
      <div class="components-grid">
        <component-item
          v-for="component in basicComponents"
          :key="component.type"
          :component="component"
          @add="addComponent"
        />
      </div>
    </div>

    <div class="components-section">
      <div class="section-title">Containers</div>
      <div class="components-grid">
        <component-item
          v-for="component in containerComponents"
          :key="component.type"
          :component="component"
          @add="addComponent"
        />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-btn clear" @click="clearCanvas">
        <span class="icon">🗑️</span>
        Clear Canvas
      </button>
      <button class="action-btn reset" @click="resetToDefault">
        <span class="icon">🔄</span>
        Reset Default
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import ComponentItem from './ComponentItem.vue'

// Store
const store = useCanvasStore()
const { addElement, clearElements } = store

// Component definitions
const basicComponents = [
  {
    type: 'button',
    name: 'Button',
    icon: '🔘',
    description: 'Interactive button element',
    defaultStyle: {
      padding: '12px 24px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    defaultText: 'Click Me'
  },
  {
    type: 'text',
    name: 'Text',
    icon: '📝',
    description: 'Text content element',
    defaultStyle: {
      padding: '12px 16px',
      backgroundColor: '#f8f9fa',
      color: '#333',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    defaultText: 'Sample Text'
  },
  {
    type: 'input',
    name: 'Input',
    icon: '📥',
    description: 'Text input field',
    defaultStyle: {
      padding: '12px 16px',
      backgroundColor: 'white',
      color: '#333',
      border: '2px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none'
    },
    defaultText: ''
  },
  {
    type: 'textarea',
    name: 'Text Area',
    icon: '📄',
    description: 'Multi-line text input',
    defaultStyle: {
      padding: '12px 16px',
      backgroundColor: 'white',
      color: '#333',
      border: '2px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '100px',
      outline: 'none'
    },
    defaultText: ''
  }
]

const containerComponents = [
  {
    type: 'card',
    name: 'Card',
    icon: '🎴',
    description: 'Container with shadow and border',
    defaultStyle: {
      padding: '24px',
      backgroundColor: 'white',
      color: '#333',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      minWidth: '200px',
      minHeight: '120px'
    },
    defaultText: 'Card Content'
  },
  {
    type: 'div',
    name: 'Container',
    icon: '📦',
    description: 'Generic container element',
    defaultStyle: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '2px dashed #dee2e6',
      borderRadius: '8px',
      minWidth: '150px',
      minHeight: '100px'
    },
    defaultText: 'Container'
  },
  {
    type: 'section',
    name: 'Section',
    icon: '📑',
    description: 'Page section with background',
    defaultStyle: {
      padding: '32px',
      backgroundColor: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      minWidth: '250px',
      minHeight: '150px'
    },
    defaultText: 'Section Content'
  }
]

// Methods
const addComponent = (component) => {
  const newElement = {
    type: component.type,
    text: component.defaultText,
    style: { ...component.defaultStyle },
    position: {
      x: Math.floor(Math.random() * 400) + 100, // Random position
      y: Math.floor(Math.random() * 300) + 100
    },
    metadata: {
      name: component.name,
      addedAt: new Date().toISOString()
    }
  }

  addElement(newElement)
}

const clearCanvas = () => {
  if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
    clearElements()
  }
}

const resetToDefault = () => {
  if (confirm('Reset canvas to default elements?')) {
    clearElements()
    
    // Add some default elements
    setTimeout(() => {
      addComponent(basicComponents[0]) // Button
      addComponent(basicComponents[1]) // Text
      addComponent(containerComponents[0]) // Card
    }, 100)
  }
}
</script>

<style scoped lang="scss">
.sidebar {
  width: 280px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .sidebar-header {
    padding: 24px 20px 16px;
    border-bottom: 1px solid #e9ecef;

    .sidebar-title {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
    }

    .sidebar-subtitle {
      margin: 0;
      font-size: 12px;
      color: #6c757d;
      font-weight: 400;
    }
  }

  .components-section {
    padding: 20px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #495057;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .components-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .quick-actions {
    padding: 20px;
    margin-top: auto;
    border-top: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      background: white;
      color: #495057;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #f8f9fa;
        transform: translateY(-1px);
      }

      &.clear:hover {
        background: #fff5f5;
        color: #e53e3e;
        border-color: #fed7d7;
      }

      &.reset:hover {
        background: #f0fff4;
        color: #38a169;
        border-color: #c6f6d5;
      }

      .icon {
        font-size: 16px;
      }
    }
  }
}

// Scrollbar styling
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>