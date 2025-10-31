// CSS Property Definitions
export const CSS_PROPERTIES = {
    // Layout
    display: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
    justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    alignItems: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
    flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
    
    // Typography
    fontFamily: ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'system-ui'],
    fontWeight: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'],
    textAlign: ['left', 'right', 'center', 'justify'],
    textDecoration: ['none', 'underline', 'overline', 'line-through'],
    textTransform: ['none', 'capitalize', 'uppercase', 'lowercase'],
    
    // Colors
    color: ['#000000', '#333333', '#666666', '#999999', '#ffffff', '#007bff', '#28a745', '#dc3545', '#ffc107', '#6c757d'],
    backgroundColor: ['transparent', '#ffffff', '#f8f9fa', '#e9ecef', '#007bff', '#28a745', '#dc3545', '#ffc107'],
    
    // Sizing
    width: ['auto', '100%', '50%', '25%', '200px', '300px', '400px'],
    height: ['auto', '100%', '50%', '200px', '300px', '400px'],
    minWidth: ['0', '100px', '200px', '300px'],
    minHeight: ['0', '100px', '200px', '300px'],
    maxWidth: ['none', '100%', '500px', '800px', '1200px'],
    maxHeight: ['none', '100%', '500px', '800px'],
    
    // Spacing
    margin: ['0', '4px', '8px', '12px', '16px', '20px', '24px', '32px'],
    padding: ['0', '4px', '8px', '12px', '16px', '20px', '24px', '32px'],
    
    // Borders
    borderStyle: ['none', 'solid', 'dashed', 'dotted', 'double'],
    borderRadius: ['0', '2px', '4px', '6px', '8px', '12px', '16px', '50%'],
    
    // Effects
    boxShadow: ['none', '0 1px 3px rgba(0,0,0,0.1)', '0 2px 4px rgba(0,0,0,0.1)', '0 4px 6px rgba(0,0,0,0.1)'],
    opacity: ['0', '0.25', '0.5', '0.75', '1']
  }
  
  // CSS Value Converters
  export const CSS_VALUE_CONVERTERS = {
    // Convert number to pixel value
    toPx: (value) => {
      if (typeof value === 'number') return `${value}px`
      if (typeof value === 'string' && /^\d+$/.test(value)) return `${value}px`
      return value
    },
    
    // Convert to percentage
    toPercent: (value) => {
      if (typeof value === 'number') return `${value}%`
      if (typeof value === 'string' && /^\d+$/.test(value)) return `${value}%`
      return value
    },
    
    // Convert to color value
    toColor: (value) => {
      if (value === 'transparent') return value
      if (value.startsWith('#')) return value
      if (value.startsWith('rgb')) return value
      if (value.startsWith('hsl')) return value
      return `#${value}`
    },
    
    // Convert to rem
    toRem: (value, base = 16) => {
      if (typeof value === 'number') return `${value / base}rem`
      if (typeof value === 'string' && value.endsWith('px')) {
        const num = parseFloat(value)
        return `${num / base}rem`
      }
      return value
    }
  }
  
  export const styleHelpers = {
    // ========== CONVERSION METHODS ==========
    
    // Convert style object to CSS string
    objectToStyleString(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return ''
      
      return Object.entries(styleObj)
        .map(([key, value]) => {
          if (value === null || value === undefined || value === '') return ''
          
          const cssKey = this.kebabCase(key)
          const formattedValue = this.formatCSSValue(cssKey, value)
          
          return `${cssKey}: ${formattedValue};`
        })
        .filter(Boolean)
        .join(' ')
    },
  
    // Convert camelCase to kebab-case
    kebabCase(str) {
      return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
    },
  
    // Convert kebab-case to camelCase
    camelCase(str) {
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    },
  
    // Convert style object for JavaScript (camelCase)
    convertStyleForJS(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return {}
      
      const result = {}
      Object.entries(styleObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const jsKey = this.camelCase(key)
          result[jsKey] = value
        }
      })
      return result
    },
  
    // Convert JavaScript style object to CSS style object
    convertJSToCSS(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return {}
      
      const result = {}
      Object.entries(styleObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const cssKey = this.kebabCase(key)
          result[cssKey] = value
        }
      })
      return result
    },
  
    // ========== VALUE FORMATTING ==========
  
    // Format CSS value based on property
    formatCSSValue(property, value) {
      if (typeof value === 'number') {
        return this.formatNumericValue(property, value)
      }
      
      if (typeof value === 'string') {
        return this.formatStringValue(property, value)
      }
      
      return value
    },
  
    // Format numeric values with appropriate units
    formatNumericValue(property, value) {
      const unitProperties = [
        'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
        'top', 'right', 'bottom', 'left',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
        'font-size', 'line-height', 'letter-spacing', 'word-spacing'
      ]
      
      const percentProperties = [
        'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
        'top', 'right', 'bottom', 'left',
        'flex-basis'
      ]
      
      if (unitProperties.includes(property)) {
        if (percentProperties.includes(property) && value <= 1) {
          return `${value * 100}%`
        }
        return `${value}px`
      }
      
      if (property === 'opacity') {
        return Math.max(0, Math.min(1, value))
      }
      
      if (property === 'font-weight') {
        const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
        const closest = weights.reduce((prev, curr) => 
          Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        )
        return closest
      }
      
      return value
    },
  
    // Format string values
    formatStringValue(property, value) {
      // Handle numeric strings
      if (/^\d+(\.\d+)?$/.test(value)) {
        const numValue = parseFloat(value)
        return this.formatNumericValue(property, numValue)
      }
      
      // Handle color values
      if (property.includes('color') || property.includes('background')) {
        return this.normalizeColor(value)
      }
      
      return value
    },
  
    // ========== COLOR METHODS ==========
  
    // Normalize color values
    normalizeColor(color) {
      if (!color) return ''
      
      // Hex colors
      if (color.startsWith('#')) {
        if (color.length === 4) { // #rgb
          return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        }
        return color.toLowerCase()
      }
      
      // RGB colors
      if (color.startsWith('rgb')) {
        return color.toLowerCase()
      }
      
      // Named colors
      const namedColors = {
        'red': '#dc3545',
        'blue': '#007bff', 
        'green': '#28a745',
        'yellow': '#ffc107',
        'orange': '#fd7e14',
        'purple': '#6f42c1',
        'pink': '#e83e8c',
        'teal': '#20c997',
        'cyan': '#17a2b8',
        'white': '#ffffff',
        'black': '#000000',
        'gray': '#6c757d',
        'grey': '#6c757d',
        'lightgray': '#f8f9fa',
        'lightgrey': '#f8f9fa',
        'darkgray': '#343a40',
        'darkgrey': '#343a40',
        'transparent': 'transparent'
      }
      
      return namedColors[color.toLowerCase()] || color
    },
  
    // Generate color palette
    generateColorPalette(baseColor) {
      if (!baseColor) return []
      
      const hex = this.normalizeColor(baseColor)
      if (!hex.startsWith('#')) return [baseColor]
      
      // Simple color variations
      const variations = []
      for (let i = 0.1; i <= 0.9; i += 0.1) {
        variations.push(this.lightenColor(hex, i))
      }
      
      return variations
    },
  
    // Lighten a color
    lightenColor(hex, amount) {
      let r = parseInt(hex.slice(1, 3), 16)
      let g = parseInt(hex.slice(3, 5), 16)
      let b = parseInt(hex.slice(5, 7), 16)
  
      r = Math.min(255, r + Math.round(amount * (255 - r)))
      g = Math.min(255, g + Math.round(amount * (255 - g)))
      b = Math.min(255, b + Math.round(amount * (255 - b)))
  
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    },
  
    // Darken a color
    darkenColor(hex, amount) {
      let r = parseInt(hex.slice(1, 3), 16)
      let g = parseInt(hex.slice(3, 5), 16)
      let b = parseInt(hex.slice(5, 7), 16)
  
      r = Math.max(0, r - Math.round(amount * r))
      g = Math.max(0, g - Math.round(amount * g))
      b = Math.max(0, b - Math.round(amount * b))
  
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    },
  
    // ========== PARSING METHODS ==========
  
    // Parse CSS value to number
    parseCSSValue(value) {
      if (!value) return 0
      if (typeof value === 'number') return value
      
      // Handle pixel values
      if (typeof value === 'string' && value.endsWith('px')) {
        return parseFloat(value) || 0
      }
      
      // Handle percentage values
      if (typeof value === 'string' && value.endsWith('%')) {
        return parseFloat(value) / 100
      }
      
      // Handle unitless numbers
      const numericValue = parseFloat(value)
      return isNaN(numericValue) ? 0 : numericValue
    },
  
    // Parse CSS string to object
    parseCSSString(cssString) {
      if (!cssString || typeof cssString !== 'string') return {}
      
      const result = {}
      const declarations = cssString.split(';').filter(dec => dec.trim())
      
      declarations.forEach(declaration => {
        const [property, value] = declaration.split(':').map(part => part.trim())
        if (property && value) {
          const jsProperty = this.camelCase(property)
          result[jsProperty] = value
        }
      })
      
      return result
    },
  
    // ========== VALIDATION METHODS ==========
  
    // Validate CSS property and value
    isValidCSSProperty(property, value) {
      if (!property || value === null || value === undefined) return false
      
      // Check if property is known
      const knownProperties = Object.keys(CSS_PROPERTIES)
      const cssProperty = this.kebabCase(property)
      
      if (!knownProperties.some(prop => this.kebabCase(prop) === cssProperty)) {
        console.warn(`Unknown CSS property: ${property}`)
        return true // Allow unknown properties
      }
      
      // Type-specific validation
      if (property.includes('color') || property.includes('background')) {
        return this.isValidColor(value)
      }
      
      if (property.includes('width') || property.includes('height') || property.includes('size')) {
        return this.isValidSize(value)
      }
      
      return true
    },
  
    // Validate color value
    isValidColor(color) {
      if (!color) return false
      
      // Hex color
      if (color.startsWith('#')) {
        return /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) || /^#([A-Fa-f0-9]{4}){1,2}$/.test(color)
      }
      
      // RGB color
      if (color.startsWith('rgb(') || color.startsWith('rgba(')) {
        return true // Basic validation
      }
      
      // Named color
      const namedColors = [
        'transparent', 'currentColor', 'inherit', 'initial', 'unset',
        'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 
        'purple', 'pink', 'teal', 'cyan', 'gray', 'grey'
      ]
      
      return namedColors.includes(color.toLowerCase())
    },
  
    // Validate size value
    isValidSize(value) {
      if (!value) return false
      
      if (typeof value === 'number') return true
      
      if (typeof value === 'string') {
        return /^(\d+(\.\d+)?)(px|%|em|rem|vh|vw|vmin|vmax)$/.test(value) || 
               value === 'auto' || 
               value === 'inherit' || 
               value === 'initial'
      }
      
      return false
    },
  
    // ========== STYLE MANIPULATION ==========
  
    // Merge styles with defaults (deep merge for nested objects)
    mergeStyles(customStyles, defaultStyles) {
      if (!defaultStyles) return { ...customStyles }
      if (!customStyles) return { ...defaultStyles }
      
      const result = { ...defaultStyles }
      
      Object.entries(customStyles).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'object' && !Array.isArray(value) && 
              typeof result[key] === 'object' && !Array.isArray(result[key])) {
            result[key] = { ...result[key], ...value }
          } else {
            result[key] = value
          }
        }
      })
      
      return result
    },
  
    // Remove undefined, null, or empty values from style object
    cleanStyleObject(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return {}
      
      const cleanObj = {}
      Object.entries(styleObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleanObj[key] = value
        }
      })
      
      return cleanObj
    },
  
    // Normalize style object (convert all values to proper format)
    normalizeStyleObject(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return {}
      
      const normalized = {}
      Object.entries(styleObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const cssKey = this.kebabCase(key)
          normalized[cssKey] = this.formatCSSValue(cssKey, value)
        }
      })
      
      return normalized
    },
  
    // Extract specific properties from style object
    extractProperties(styleObj, properties) {
      if (!styleObj || typeof styleObj !== 'object') return {}
      
      const extracted = {}
      properties.forEach(prop => {
        const jsProp = this.camelCase(prop)
        if (styleObj[jsProp] !== undefined) {
          extracted[jsProp] = styleObj[jsProp]
        }
      })
      
      return extracted
    },
  
    // ========== LAYOUT HELPERS ==========
  
    // Calculate flexbox styles
    createFlexboxStyles(direction = 'row', justify = 'flex-start', align = 'stretch', wrap = 'nowrap') {
      return {
        display: 'flex',
        flexDirection: direction,
        justifyContent: justify,
        alignItems: align,
        flexWrap: wrap
      }
    },
  
    // Calculate grid styles
    createGridStyles(columns = '1fr', gap = '8px') {
      return {
        display: 'grid',
        gridTemplateColumns: columns,
        gap: gap
      }
    },
  
    // Calculate spacing styles
    createSpacingStyles(margin = '0', padding = '0') {
      return {
        margin: this.withUnit(margin),
        padding: this.withUnit(padding)
      }
    },
  
    // ========== UTILITY METHODS ==========
  
    // Generate CSS value with unit
    withUnit(value, unit = 'px') {
      if (typeof value === 'number') {
        return `${value}${unit}`
      }
      if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
        return `${parseFloat(value)}${unit}`
      }
      return value
    },
  
    // Generate responsive style object
    createResponsiveStyles(baseStyles, breakpoints = {}) {
      const responsiveStyles = { ...baseStyles }
      
      Object.entries(breakpoints).forEach(([breakpoint, styles]) => {
        responsiveStyles[`@media (min-width: ${breakpoint})`] = styles
      })
      
      return responsiveStyles
    },
  
    // Generate CSS class name
    generateClassName(prefix = 'element', id = '') {
      const uniqueId = id || Math.random().toString(36).substr(2, 9)
      return `${prefix}-${uniqueId}`
    },
  
    // Check if style object is empty
    isEmptyStyle(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return true
      return Object.keys(this.cleanStyleObject(styleObj)).length === 0
    },
  
    // Clone style object
    cloneStyle(styleObj) {
      if (!styleObj || typeof styleObj !== 'object') return {}
      return JSON.parse(JSON.stringify(styleObj))
    }
  }
  
  // Export individual functions for tree-shaking
  export const {
    objectToStyleString,
    kebabCase,
    camelCase,
    convertStyleForJS,
    convertJSToCSS,
    formatCSSValue,
    parseCSSValue,
    parseCSSString,
    isValidCSSProperty,
    isValidColor,
    isValidSize,
    mergeStyles,
    cleanStyleObject,
    normalizeStyleObject,
    extractProperties,
    createFlexboxStyles,
    createGridStyles,
    createSpacingStyles,
    withUnit,
    generateClassName,
    isEmptyStyle,
    cloneStyle
  } = styleHelpers
  
  export default styleHelpers