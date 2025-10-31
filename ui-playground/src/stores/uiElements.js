import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State untuk layout
  const isSidebarCollapsed = ref(false)
  const showPropertyPanel = ref(true)
  const showExportModal = ref(false)
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // State tambahan untuk UI
  const theme = ref('light')
  const currentView = ref('design')
  const notifications = ref([])
  const activeTool = ref('select')

  // Computed properties
  const isDarkTheme = computed(() => theme.value === 'dark')
  const hasNotifications = computed(() => notifications.value.length > 0)

  // Actions untuk layout
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    console.log('📁 Sidebar toggled:', isSidebarCollapsed.value)
  }

  const togglePropertyPanel = () => {
    showPropertyPanel.value = !showPropertyPanel.value
    console.log('🎛️ Property panel toggled:', showPropertyPanel.value)
  }

  const toggleExportModal = () => {
    showExportModal.value = !showExportModal.value
    console.log('📤 Export modal toggled:', showExportModal.value)
  }

  const setLoading = (loading, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
    console.log('⏳ Loading:', loading, message)
  }

  // Theme actions
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    console.log('🎨 Theme toggled:', theme.value)
  }

  // Notification system
  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000,
      timestamp: new Date()
    }
    
    notifications.value.push(newNotification)
    console.log('💬 Notification added:', newNotification)

    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      console.log('💬 Notification removed:', id)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
    console.log('💬 All notifications cleared')
  }

  return {
    // State
    isSidebarCollapsed,
    showPropertyPanel,
    showExportModal,
    isLoading,
    loadingMessage,
    theme,
    currentView,
    notifications,
    activeTool,
    
    // Computed
    isDarkTheme,
    hasNotifications,
    
    // Actions
    toggleSidebar,
    togglePropertyPanel,
    toggleExportModal,
    setLoading,
    toggleTheme,
    addNotification,
    removeNotification,
    clearNotifications
  }
})