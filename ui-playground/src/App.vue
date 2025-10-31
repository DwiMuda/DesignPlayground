<template>
  <div class="container">
    <SidebarTools />
    <CanvasArea />
    <PropertyEditor />
  </div>

  <!-- Tombol Export -->
  <div class="export-btn">
    <button @click="openExport = true">Export HTML</button>
  </div>

  <!-- Modal Export -->
  <ExportModal :show="openExport" @close="openExport = false" />
</template>

<script setup>
import SidebarTools from './components/SidebarTools.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyEditor from './components/PropertyEditor.vue'
import ExportModal from './components/ExportModal.vue'
import { ref } from 'vue'
import CanvasElement from './components/CanvasElement.vue'

const openExport = ref(false)
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.export-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.export-btn button {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.export-btn button:hover {
  background: #218838;
}
</style>
