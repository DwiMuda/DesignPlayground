<template>
    <div class="editor">
      <h2>Properti</h2>
  
      <div v-if="selectedElement">
        <!-- Teks -->
        <label>Teks:</label>
        <input type="text" v-model="selectedElement.text" />
  
        <!-- Warna Latar -->
        <label>Warna Latar:</label>
        <input type="color" v-model="selectedElement.style.background" />
  
        <!-- Warna Teks -->
        <label>Warna Teks:</label>
        <input type="color" v-model="selectedElement.style.color" />
  
        <!-- Border Radius -->
        <label>Radius: {{ radiusValue }}px</label>
        <input
          type="range"
          min="0"
          max="50"
          v-model.number="radiusValue"
        />
  
        <!-- Hapus -->
        <button class="delete" @click="removeElement(selectedElement.id)">Hapus</button>
      </div>
  
      <p v-else>Pilih elemen untuk mengedit</p>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useUIStore } from '../store/uiElements'
  
  const store = useUIStore()
  const selectedElement = ref(null)
  const radiusValue = ref(0)
  
  // Sync selected element dari store
  watch(
    () => store.selectedElement,
    (val) => {
      selectedElement.value = val
      if (val && val.style.borderRadius) {
        // Hapus 'px' jika ada, simpan angka saja di slider
        radiusValue.value = parseInt(val.style.borderRadius)
      }
    },
    { immediate: true }
  )
  
  // Update borderRadius saat slider berubah
  watch(radiusValue, (val) => {
    if (selectedElement.value) {
      selectedElement.value.style.borderRadius = val + 'px'
    }
  })
  
  function removeElement(id) {
    store.elements = store.elements.filter((el) => el.id !== id)
    if (selectedElement.value?.id === id) selectedElement.value = null
    store.selectedElement = null
  }
  </script>
  
  <style scoped>
  .editor {
    width: 250px;
    border-left: 1px solid #ccc;
    padding: 16px;
    background: #fafafa;
  }
  .editor h2 {
    margin-bottom: 10px;
  }
  .editor label {
    display: block;
    margin-top: 10px;
    font-weight: bold;
  }
  .editor input[type="color"],
  .editor input[type="text"],
  .editor input[type="range"] {
    width: 100%;
    margin-top: 5px;
  }
  .delete {
    margin-top: 15px;
    background: #d9534f;
    color: white;
    border: none;
    padding: 8px;
    width: 100%;
    border-radius: 5px;
    cursor: pointer;
  }
  .delete:hover {
    background: #c9302c;
  }
  </style>
  