import { ref, computed } from 'vue'
import { exportGenerators } from '../utils/exportGenerators'

export function useExport(elements) {
  const exportFormat = ref('html')
  const exportOptions = ref({
    includeContainer: true,
    cssOutput: 'inline',
    scriptSetup: true
  })

  const generatedCode = computed(() => {
    switch (exportFormat.value) {
      case 'html':
        return exportGenerators.generateHTML(elements.value, exportOptions.value)
      case 'react':
        return exportGenerators.generateReact(elements.value, exportOptions.value)
      case 'vue':
        return exportGenerators.generateVue(elements.value, exportOptions.value)
      default:
        return exportGenerators.generateHTML(elements.value, exportOptions.value)
    }
  })

  const codeStats = computed(() => {
    const code = generatedCode.value
    return {
      lines: code.split('\n').length,
      size: (new Blob([code]).size / 1024).toFixed(2),
      elements: elements.value.length
    }
  })

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode.value)
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = generatedCode.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  }

  const downloadFile = () => {
    const blob = new Blob([generatedCode.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    
    let extension = 'html'
    if (exportFormat.value === 'react') extension = 'jsx'
    if (exportFormat.value === 'vue') extension = 'vue'
    
    a.href = url
    a.download = `design-export.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    exportFormat,
    exportOptions,
    generatedCode,
    codeStats,
    copyToClipboard,
    downloadFile
  }
}