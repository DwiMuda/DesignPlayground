import { ref } from 'vue'

// Simple reactive state
const isSidebarCollapsed = ref(false)
const showPropertyPanel = ref(true)
const showExportModal = ref(false)
const isLoading = ref(false)
const loadingMessage = ref('')

export function useUIStore() {
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const togglePropertyPanel = () => {
    showPropertyPanel.value = !showPropertyPanel.value
  }

  const toggleExportModal = () => {
    showExportModal.value = !showExportModal.value
  }

  const setLoading = (loading, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  return {
    // State
    isSidebarCollapsed,
    showPropertyPanel,
    showExportModal,
    isLoading,
    loadingMessage,
    
    // Actions
    toggleSidebar,
    togglePropertyPanel,
    toggleExportModal,
    setLoading
  }
}