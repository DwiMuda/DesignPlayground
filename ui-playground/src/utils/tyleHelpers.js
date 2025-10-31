export const styleHelpers = {
    // Convert style object to CSS string
    objectToStyleString(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return ''
      
      return Object.entries(styleObj)
        .map(([key, value]) => {
          if (value === null || value === undefined) return ''
          const cssKey = this.kebabCase(key)
          return `${cssKey}: ${value};`
        })
        .filter(Boolean)
        .join(' ')
    },
  
    // Convert camelCase to kebab-case
    kebabCase(str) {
      return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
    },
  
    // Convert style object for JavaScript (camelCase)
    convertStyleForJS(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return {}
      
      const result = {}
      Object.entries(styleObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const jsKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
          result[jsKey] = value
        }
      })
      return result
    },
  
    // Parse CSS value to number
    parseCSSValue(value) {
      if (!value) return 0
      if (typeof value === 'number') return value
      
      const numericValue = parseFloat(value)
      return isNaN(numericValue) ? 0 : numericValue
    },
  
    // Generate CSS value with unit
    withUnit(value, unit = 'px') {
      if (typeof value === 'number') {
        return `${value}${unit}`
      }
      if (typeof value === 'string' && value.match(/^\d+(\.\d+)?$/)) {
        return `${parseFloat(value)}${unit}`
      }
      return value
    },
  
    // Merge styles with defaults
    mergeStyles(customStyles, defaultStyles) {
      return { ...defaultStyles, ...customStyles }
    },
  
    // Validate CSS property
    isValidCSSProperty(property, value) {
      // Basic validation - can be expanded
      if (property.includes('color') && value) {
        return this.isValidColor(value)
      }
      return true
    },
  
    // Basic color validation
    isValidColor(color) {
      const s = new Option().style
      s.color = color
      return s.color !== ''
    }
  }