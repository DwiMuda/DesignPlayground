<template>
    <div
      class="component-item"
      :class="{ draggable: true }"
      draggable="true"
      @dragstart="handleDragStart"
      @click="handleClick"
    >
      <div class="component-icon">
        {{ component.icon }}
      </div>
      <div class="component-info">
        <div class="component-name">{{ component.name }}</div>
        <div class="component-description">{{ component.description }}</div>
      </div>
      <div class="component-action">
        <button class="add-btn" title="Add to canvas">
          <span class="add-icon">+</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    component: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['add'])
  
  const handleClick = () => {
    emit('add', props.component)
  }
  
  const handleDragStart = (event) => {
    event.dataTransfer.setData('application/json', JSON.stringify(props.component))
    event.dataTransfer.effectAllowed = 'copy'
  }
  </script>
  
  <style scoped lang="scss">
  .component-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s ease;
    position: relative;
  
    &:hover {
      border-color: #3498db;
      background: #f8f9fa;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
      .add-btn {
        opacity: 1;
        transform: scale(1);
      }
    }
  
    &:active {
      cursor: grabbing;
      transform: translateY(0);
    }
  
    .component-icon {
      font-size: 20px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 6px;
      flex-shrink: 0;
    }
  
    .component-info {
      flex: 1;
      min-width: 0;
  
      .component-name {
        font-weight: 600;
        color: #2c3e50;
        font-size: 14px;
        margin-bottom: 2px;
      }
  
      .component-description {
        font-size: 12px;
        color: #6c757d;
        line-height: 1.3;
      }
    }
  
    .component-action {
      .add-btn {
        width: 28px;
        height: 28px;
        border: none;
        background: #3498db;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.2s ease;
  
        .add-icon {
          font-size: 16px;
          font-weight: 600;
        }
  
        &:hover {
          background: #2980b9;
          transform: scale(1.1);
        }
      }
    }
  }
  
  // Touch device support
  @media (hover: none) {
    .component-item .add-btn {
      opacity: 1;
      transform: scale(1);
    }
  }
  </style>