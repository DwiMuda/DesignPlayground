import { defineStore } from 'pinia'

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    elements: [],
    selectedElementId: null
  }),

  actions: {
    addElement(element) {
      this.elements.push(element)
    },
    selectElement(id) {
      this.selectedElementId = id
    },
    updateElementStyle(id, newStyle) {
      const el = this.elements.find(e => e.id === id)
      if (el) {
        el.style = { ...el.style, ...newStyle }
      }
    },
    removeElement(id) {
      this.elements = this.elements.filter(e => e.id !== id)
    }
  },

  getters: {
    selectedElement: (state) =>
      state.elements.find(e => e.id === state.selectedElementId)
  }
})
