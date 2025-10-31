import { styleHelpers } from './styleHelpers.js'
import { 
  ELEMENT_TYPES, 
  DEFAULT_PROPERTIES,
  getElementName 
} from './constants.js'

export const exportGenerators = {
  
  // HTML Generator dengan options lengkap
  generateHTML(elements, options = {}) {
    const { 
      includeContainer = true, 
      cssOutput = 'inline',
      includeMeta = true,
      includeReset = true,
      responsive = true,
      minify = false
    } = options
    
    const elementsHTML = this.generateElementsHTML(elements, options)
    
    if (!includeContainer) {
      return minify ? this.minifyHTML(elementsHTML) : elementsHTML
    }

    const metaTags = includeMeta ? `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="Design Playground">
    <title>${options.title || 'Exported Design'}</title>` : ''

    const resetCSS = includeReset ? `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }` : ''

    const responsiveCSS = responsive ? `
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
        }` : ''

    if (cssOutput === 'external') {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>${metaTags}
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
${elementsHTML}
    </div>
</body>
</html>`
      return minify ? this.minifyHTML(html) : html
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>${metaTags}
    <style>
        ${resetCSS}
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        ${responsiveCSS}
        ${this.generateInlineCSS(elements)}
    </style>
</head>
<body>
    <div class="container">
${elementsHTML}
    </div>
</body>
</html>`
    
    return minify ? this.minifyHTML(html) : html
  },

  // React Component Generator
  generateReact(elements, options = {}) {
    const { 
      functionalComponent = true,
      useTypeScript = false,
      includeCSS = true,
      componentName = 'ExportedComponent'
    } = options

    const elementsJSX = this.generateElementsJSX(elements)
    const imports = useTypeScript 
      ? `import React from 'react';\nimport './${componentName}.css';`
      : `import React from 'react';\nimport './${componentName}.css';`

    const component = functionalComponent ? 
`${imports}

const ${componentName} = () => {
  return (
    <div className="${componentName.toLowerCase()}-container">
${elementsJSX}
    </div>
  );
};

export default ${componentName};` :
`${imports}

class ${componentName} extends React.Component {
  render() {
    return (
      <div className="${componentName.toLowerCase()}-container">
${elementsJSX}
      </div>
    );
  }
}

export default ${componentName};`

    const css = includeCSS ? this.generateReactCSS(componentName, elements) : ''
    
    return {
      component,
      css,
      fileName: `${componentName}.${useTypeScript ? 'tsx' : 'jsx'}`
    }
  },

  // Vue Component Generator
  generateVue(elements, options = {}) {
    const { 
      scriptSetup = true,
      useTypeScript = false,
      compositionAPI = true,
      componentName = 'ExportedComponent'
    } = options

    const elementsTemplate = this.generateElementsVue(elements)
    const scriptLang = useTypeScript ? ' lang="ts"' : ''

    if (scriptSetup) {
      return `<template>
  <div class="${componentName.toLowerCase()}-container">
${elementsTemplate}
  </div>
</template>

<script setup${scriptLang}>
// Composition API with script setup
${useTypeScript ? '// TypeScript support' : ''}
</script>

<style scoped>
.${componentName.toLowerCase()}-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
}
${this.generateVueCSS(elements)}
</style>`
    }

    return `<template>
  <div class="${componentName.toLowerCase()}-container">
${elementsTemplate}
  </div>
</template>

<script${scriptLang}>
${compositionAPI ? 
`import { defineComponent } from 'vue'

export default defineComponent({
  name: '${componentName}'
})` : 
`export default {
  name: '${componentName}'
}`}
</script>

<style scoped>
.${componentName.toLowerCase()}-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
}
${this.generateVueCSS(elements)}
</style>`
  },

  // JSON Export untuk data structure
  generateJSON(elements, options = {}) {
    const { 
      includeMetadata = true,
      prettyPrint = true
    } = options

    const exportData = {
      ...(includeMetadata && {
        metadata: {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          generator: 'Design Playground',
          elementCount: elements?.length || 0
        }
      }),
      elements: elements?.map(element => this.serializeElement(element)) || []
    }

    return prettyPrint 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData)
  },

  // CSS Only Export
  generateCSS(elements, options = {}) {
    const { 
      includeReset = true,
      responsive = true,
      methodology = 'bem' // 'bem', 'smacss', 'oocss'
    } = options

    let css = ''

    if (includeReset) {
      css += `/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f8f9fa;
}\n\n`
    }

    css += `/* Design Elements */\n`
    css += this.generateElementsCSS(elements, methodology)

    if (responsive) {
      css += `\n/* Responsive Design */\n`
      css += `@media (max-width: 768px) {\n`
      css += `  .container { padding: 10px; }\n`
      css += `  .element { margin: 10px 0; }\n`
      css += `}\n\n`

      css += `@media (max-width: 480px) {\n`
      css += `  .container { padding: 5px; }\n`
      css += `}\n`
    }

    return css
  },

  // Tailwind CSS Export
  generateTailwind(elements, options = {}) {
    const elementsHTML = this.generateElementsTailwind(elements)
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind Design</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen p-8">
    <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
${elementsHTML}
    </div>
</body>
</html>`
  },

  // ========== ELEMENT GENERATORS ==========

  generateElementsHTML(elements, options = {}) {
    if (!elements?.length) {
      return '        <!-- No elements to display -->'
    }

    return elements.map((element, index) => {
      const styleStr = styleHelpers.objectToStyleString(element.style)
      const className = `element-${index} ${element.type}`
      
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
        case ELEMENT_TYPES.PARAGRAPH:
          return `        <div class="${className}" style="${styleStr}">${element.text || element.content || getElementName(element.type)}</div>`
        
        case ELEMENT_TYPES.BUTTON:
          return `        <button class="${className}" style="${styleStr}">${element.text || 'Button'}</button>`
        
        case ELEMENT_TYPES.IMAGE:
          return `        <img class="${className}" src="${element.properties?.src || element.src || '/placeholder.jpg'}" style="${styleStr}" alt="${element.properties?.alt || 'Image'}" />`
        
        case ELEMENT_TYPES.INPUT:
          return `        <input class="${className}" type="${element.properties?.type || 'text'}" style="${styleStr}" placeholder="${element.properties?.placeholder || 'Enter text...'}" value="${element.text || ''}" />`
        
        case ELEMENT_TYPES.TEXTAREA:
          return `        <textarea class="${className}" style="${styleStr}" placeholder="${element.properties?.placeholder || 'Enter text...'}" rows="${element.properties?.rows || 4}">${element.text || ''}</textarea>`
        
        case ELEMENT_TYPES.SELECT:
          const options = (element.properties?.options || ['Option 1', 'Option 2']).map(opt => 
            `            <option value="${opt.toLowerCase()}">${opt}</option>`
          ).join('\n')
          return `        <select class="${className}" style="${styleStr}">\n${options}\n        </select>`
        
        case ELEMENT_TYPES.CARD:
          return `        <div class="${className}" style="${styleStr}">\n            <div class="card-content">${element.text || 'Card Content'}</div>\n        </div>`
        
        case ELEMENT_TYPES.HEADING:
          return `        <h2 class="${className}" style="${styleStr}">${element.text || 'Heading'}</h2>`
        
        case ELEMENT_TYPES.LINK:
          return `        <a class="${className}" href="${element.properties?.href || '#'}" style="${styleStr}">${element.text || 'Link'}</a>`
        
        case ELEMENT_TYPES.DIVIDER:
          return `        <hr class="${className}" style="${styleStr}" />`
        
        case ELEMENT_TYPES.CONTAINER:
        case ELEMENT_TYPES.SECTION:
          const children = element.children || element.elements || []
          const childrenHTML = children.length ? this.generateElementsHTML(children, options) : '          <!-- Empty container -->'
          return `        <div class="${className}" style="${styleStr}">\n${childrenHTML}\n        </div>`
        
        default:
          return `        <div class="${className}" style="${styleStr}">${element.text || element.content || getElementName(element.type)}</div>`
      }
    }).join('\n')
  },

  generateElementsJSX(elements, indent = '      ') {
    if (!elements?.length) {
      return `${indent}{/* No elements to display */}`
    }

    return elements.map((element, index) => {
      const styleObj = JSON.stringify(styleHelpers.convertStyleForJS(element.style))
      const className = `element-${index} ${element.type}`
      
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
        case ELEMENT_TYPES.PARAGRAPH:
          return `${indent}<div className="${className}" style={${styleObj}}>${element.text || element.content || getElementName(element.type)}</div>`
        
        case ELEMENT_TYPES.BUTTON:
          return `${indent}<button className="${className}" style={${styleObj}}>${element.text || 'Button'}</button>`
        
        case ELEMENT_TYPES.IMAGE:
          return `${indent}<img className="${className}" src="${element.properties?.src || element.src || '/placeholder.jpg'}" style={${styleObj}} alt="${element.properties?.alt || 'Image'}" />`
        
        case ELEMENT_TYPES.INPUT:
          return `${indent}<input className="${className}" type="${element.properties?.type || 'text'}" style={${styleObj}} placeholder="${element.properties?.placeholder || 'Enter text...'}" defaultValue="${element.text || ''}" />`
        
        case ELEMENT_TYPES.TEXTAREA:
          return `${indent}<textarea className="${className}" style={${styleObj}} placeholder="${element.properties?.placeholder || 'Enter text...'}" rows={${element.properties?.rows || 4}}>${element.text || ''}</textarea>`
        
        case ELEMENT_TYPES.SELECT:
          const options = (element.properties?.options || ['Option 1', 'Option 2']).map(opt => 
            `${indent}  <option value="${opt.toLowerCase()}">${opt}</option>`
          ).join('\n')
          return `${indent}<select className="${className}" style={${styleObj}}>\n${options}\n${indent}</select>`
        
        case ELEMENT_TYPES.CARD:
          return `${indent}<div className="${className}" style={${styleObj}}>\n${indent}  <div className="card-content">${element.text || 'Card Content'}</div>\n${indent}</div>`
        
        case ELEMENT_TYPES.HEADING:
          return `${indent}<h2 className="${className}" style={${styleObj}}>${element.text || 'Heading'}</h2>`
        
        case ELEMENT_TYPES.LINK:
          return `${indent}<a className="${className}" href="${element.properties?.href || '#'}" style={${styleObj}}>${element.text || 'Link'}</a>`
        
        case ELEMENT_TYPES.DIVIDER:
          return `${indent}<hr className="${className}" style={${styleObj}} />`
        
        case ELEMENT_TYPES.CONTAINER:
        case ELEMENT_TYPES.SECTION:
          const children = element.children || element.elements || []
          const childrenJSX = children.length ? this.generateElementsJSX(children, indent + '  ') : `${indent}  {/* Empty container */}`
          return `${indent}<div className="${className}" style={${styleObj}}>\n${childrenJSX}\n${indent}</div>`
        
        default:
          return `${indent}<div className="${className}" style={${styleObj}}>${element.text || element.content || getElementName(element.type)}</div>`
      }
    }).join('\n')
  },

  generateElementsVue(elements, indent = '    ') {
    if (!elements?.length) {
      return `${indent}<!-- No elements to display -->`
    }

    return elements.map((element, index) => {
      const styleObj = JSON.stringify(styleHelpers.convertStyleForJS(element.style))
      const className = `element-${index} ${element.type}`
      
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
        case ELEMENT_TYPES.PARAGRAPH:
          return `${indent}<div class="${className}" :style="${styleObj}">${element.text || element.content || getElementName(element.type)}</div>`
        
        case ELEMENT_TYPES.BUTTON:
          return `${indent}<button class="${className}" :style="${styleObj}">${element.text || 'Button'}</button>`
        
        case ELEMENT_TYPES.IMAGE:
          return `${indent}<img class="${className}" src="${element.properties?.src || element.src || '/placeholder.jpg'}" :style="${styleObj}" alt="${element.properties?.alt || 'Image'}" />`
        
        case ELEMENT_TYPES.INPUT:
          return `${indent}<input class="${className}" type="${element.properties?.type || 'text'}" :style="${styleObj}" placeholder="${element.properties?.placeholder || 'Enter text...'}" :value="${element.text || ''}" />`
        
        case ELEMENT_TYPES.TEXTAREA:
          return `${indent}<textarea class="${className}" :style="${styleObj}" placeholder="${element.properties?.placeholder || 'Enter text...'}" rows="${element.properties?.rows || 4}">${element.text || ''}</textarea>`
        
        case ELEMENT_TYPES.SELECT:
          const options = (element.properties?.options || ['Option 1', 'Option 2']).map(opt => 
            `${indent}  <option value="${opt.toLowerCase()}">${opt}</option>`
          ).join('\n')
          return `${indent}<select class="${className}" :style="${styleObj}">\n${options}\n${indent}</select>`
        
        case ELEMENT_TYPES.CARD:
          return `${indent}<div class="${className}" :style="${styleObj}">\n${indent}  <div class="card-content">${element.text || 'Card Content'}</div>\n${indent}</div>`
        
        case ELEMENT_TYPES.HEADING:
          return `${indent}<h2 class="${className}" :style="${styleObj}">${element.text || 'Heading'}</h2>`
        
        case ELEMENT_TYPES.LINK:
          return `${indent}<a class="${className}" href="${element.properties?.href || '#'}" :style="${styleObj}">${element.text || 'Link'}</a>`
        
        case ELEMENT_TYPES.DIVIDER:
          return `${indent}<hr class="${className}" :style="${styleObj}" />`
        
        case ELEMENT_TYPES.CONTAINER:
        case ELEMENT_TYPES.SECTION:
          const children = element.children || element.elements || []
          const childrenVue = children.length ? this.generateElementsVue(children, indent + '  ') : `${indent}  <!-- Empty container -->`
          return `${indent}<div class="${className}" :style="${styleObj}">\n${childrenVue}\n${indent}</div>`
        
        default:
          return `${indent}<div class="${className}" :style="${styleObj}">${element.text || element.content || getElementName(element.type)}</div>`
      }
    }).join('\n')
  },

  generateElementsTailwind(elements, indent = '        ') {
    if (!elements?.length) {
      return `${indent}<!-- No elements to display -->`
    }

    return elements.map(element => {
      // Basic Tailwind mapping - bisa diperluas
      const tailwindClasses = this.mapStyleToTailwind(element.style)
      
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
          return `${indent}<div class="${tailwindClasses}">${element.text || 'Text'}</div>`
        case ELEMENT_TYPES.BUTTON:
          return `${indent}<button class="${tailwindClasses} bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">${element.text || 'Button'}</button>`
        case ELEMENT_TYPES.CARD:
          return `${indent}<div class="${tailwindClasses} bg-white rounded-lg shadow-md p-6">${element.text || 'Card Content'}</div>`
        default:
          return `${indent}<div class="${tailwindClasses}">${element.text || 'Element'}</div>`
      }
    }).join('\n')
  },

  // ========== CSS GENERATORS ==========

  generateInlineCSS(elements) {
    let css = ''
    elements?.forEach((element, index) => {
      if (element.style && Object.keys(element.style).length > 0) {
        css += `        .element-${index} { ${styleHelpers.objectToStyleString(element.style)} }\n`
      }
    })
    return css
  },

  generateElementsCSS(elements, methodology = 'bem') {
    let css = ''
    let elementIndex = 0
    
    const processElement = (element, parentClass = '') => {
      const baseClass = methodology === 'bem' ? 'element' : 'comp'
      const className = parentClass ? `${parentClass}__${element.type}` : `${baseClass}-${elementIndex}`
      
      if (element.style && Object.keys(element.style).length > 0) {
        css += `.${className} {\n`
        Object.entries(element.style).forEach(([prop, value]) => {
          css += `  ${prop}: ${value};\n`
        })
        css += `}\n\n`
        elementIndex++
      }
      
      if (element.children) {
        element.children.forEach(child => processElement(child, className))
      }
    }
    
    elements?.forEach(element => processElement(element))
    return css
  },

  generateReactCSS(componentName, elements) {
    return `.${componentName.toLowerCase()}-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

${this.generateElementsCSS(elements)}`
  },

  generateVueCSS(elements) {
    return this.generateElementsCSS(elements)
  },

  // ========== HELPER METHODS ==========

  serializeElement(element) {
    return {
      id: element.id,
      type: element.type,
      text: element.text,
      content: element.content,
      style: element.style,
      properties: element.properties,
      children: element.children?.map(child => this.serializeElement(child)),
      position: element.position,
      metadata: {
        createdAt: element.createdAt,
        updatedAt: element.updatedAt
      }
    }
  },

  mapStyleToTailwind(style) {
    const mappings = {
      padding: (val) => `p-${this.mapSizeToTailwind(val)}`,
      margin: (val) => `m-${this.mapSizeToTailwind(val)}`,
      backgroundColor: (val) => `bg-${this.mapColorToTailwind(val)}`,
      color: (val) => `text-${this.mapColorToTailwind(val)}`,
      fontSize: (val) => `text-${this.mapSizeToTailwind(val)}`,
      fontWeight: (val) => `font-${val}`
    }

    return Object.entries(style)
      .map(([prop, value]) => mappings[prop]?.(value) || '')
      .filter(Boolean)
      .join(' ')
  },

  mapSizeToTailwind(value) {
    const sizeMap = {
      '8px': '2', '12px': '3', '16px': '4', '20px': '5', '24px': '6'
    }
    return sizeMap[value] || '4'
  },

  mapColorToTailwind(value) {
    const colorMap = {
      '#007bff': 'blue-500',
      '#28a745': 'green-500', 
      '#dc3545': 'red-500',
      '#ffc107': 'yellow-500',
      '#6c757d': 'gray-500'
    }
    return colorMap[value] || 'gray-500'
  },

  minifyHTML(html) {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
  }
}

export default exportGenerators