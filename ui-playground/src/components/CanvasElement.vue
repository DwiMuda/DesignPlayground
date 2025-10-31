<template>
    <div
      class="canvas-element"
      :class="{ 
        selected: isSelected,
        [element.type]: true 
      }"
      :style="elementStyle"
      @click.stop="handleSelect"
      @dblclick="handleDoubleClick"
    >
      <component 
        :is="elementComponent" 
        :style="element.style"
        class="element-content"
      >
        {{ element.text }}
      </component>
  
      <!-- Selection Handles -->
      <div v-if="isSelected" class="selection-handles">
        <div 
          v-for="handle in handles" 
          :key="handle"
          :class="['handle', handle]"
          @mousedown.stop="startResize(handle, $event)"
        ></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    element: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    zoomLevel: {
      type: Number,
      default: 1
    }
  })
  
  const emit = defineEmits(['select', 'update', 'delete'])
  
  const elementComponent = computed(() => {
    const componentMap = {
      button: 'button',
      text: 'div',
      input: 'input',
      textarea: 'textarea',
      div: 'div',
      span: 'span'
    }
    return componentMap[props.element.type] || 'div'
  })
  
  const elementStyle = computed(() => ({
    position: 'absolute',
    left: `${props.element.position?.x || 0}px`,
    top: `${props.element.position?.y || 0}px`,
    transform: `scale(${1 / props.zoomLevel})`,
    transformOrigin: '0 0'
  }))
  
  const handles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
  
  const handleSelect = () => {
    emit('select', props.element)
  }
  
  const handleDoubleClick = () => {
    // Enable inline editing or open property editor
    console.log('Double click on element:', props.element.id)
  }
  
  const startResize = (handle, event) => {
    event.preventDefault()
    // Implement resize logic here
    console.log('Start resize from handle:', handle)
  }
  </script>
  
  <style scoped lang="scss">
  .canvas-element {
    position: absolute;
    cursor: move;
    transition: all 0.1s ease;
  
    &:hover {
      outline: 2px dashed #3498db;
    }
  
    &.selected {
      outline: 2px solid #3498db;
      z-index: 10;
    }
  
    .element-content {
      width: 100%;
      height: 100%;
      
      // Reset button styles for button elements
      button& {
        border: none;
        background: none;
        font: inherit;
        cursor: pointer;
      }
      
      // Reset input styles
      input&, textarea& {
        border: none;
        background: none;
        font: inherit;
        outline: none;
      }
    }
  
    .selection-handles {
      .handle {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #3498db;
        border: 1px solid white;
        border-radius: 1px;
  
        &.n { top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
        &.ne { top: -4px; right: -4px; cursor: ne-resize; }
        &.e { top: 50%; right: -4px; transform: translateY(-50%); cursor: e-resize; }
        &.se { bottom: -4px; right: -4px; cursor: se-resize; }
        &.s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
        &.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
        &.w { top: 50%; left: -4px; transform: translateY(-50%); cursor: w-resize; }
        &.nw { top: -4px; left: -4px; cursor: nw-resize; }
      }
    }
  }
  </style>