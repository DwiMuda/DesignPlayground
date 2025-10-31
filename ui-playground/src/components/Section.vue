<template>
    <div class="section">
      <Column 
        v-for="column in section.columns" 
        :key="column.id" 
        :column="column" 
        @select="$emit('select', $event)" 
      />
    </div>
  </template>
  
  <script setup>
  import Column from './Column.vue'
  const props = defineProps({ section: Object })
  </script>
  
  <style scoped>
  .section {
    border: 1px dashed #ccc;
    margin-bottom: 10px;
    padding: 10px;
  }
  </style>
  