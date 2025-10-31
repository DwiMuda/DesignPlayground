import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const elements = ref([])
  const selectedElement = ref(null)

  function addElement(el) {
    elements.value.push({ ...el, id: Date.now() })
  }

  function selectElement(id) {
    selectedElement.value = elements.value.find(e => e.id === id)
  }

  function updateSelected(key, value) {
    if (selectedElement.value) {
      selectedElement.value[key] = value
    }
  }

  function removeElement(id) {
    elements.value = elements.value.filter(e => e.id !== id)
    if (selectedElement.value?.id === id) selectedElement.value = null
  }

  return { elements, selectedElement, addElement, selectElement, updateSelected, removeElement }
})
