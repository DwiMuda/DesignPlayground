import { styleHelpers } from './styleHelpers.js'
import { ELEMENT_TYPES } from './constants.js'

export const exportGenerators = {
  generateHTML(elements, options = {}) {
    const { includeContainer = true, cssOutput = 'inline' } = options
    
    const elementsHTML = this.generateElementsHTML(elements)
    
    if (!includeContainer) {
      return elementsHTML
    }

    if (cssOutput === 'external') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Design</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        ${this.generateExternalCSS(elements)}
    </style>
</head>
<body>
    <div class="container">
${elementsHTML}
    </div>
</body>
</html>`
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Design</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
${elementsHTML}
    </div>
</body>
</html>`
  },

  generateReact(elements, options = {}) {
    const elementsJSX = this.generateElementsJSX(elements)
    
    return `import React from 'react';
import './ExportedComponent.css';

const ExportedComponent = () => {
  return (
    <div className="container">
${elementsJSX}
    </div>
  );
};

export default ExportedComponent;`
  },

  generateVue(elements, options = {}) {
    const { scriptSetup = true } = options
    const elementsTemplate = this.generateElementsVue(elements)

    if (scriptSetup) {
      return `<template>
  <div class="container">
${elementsTemplate}
  </div>
</template>

<script setup>
// Composition API with script setup
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>`
    }

    return `<template>
  <div class="container">
${elementsTemplate}
  </div>
</template>

<script>
export default {
  name: 'ExportedComponent'
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>`
  },

  generateElementsHTML(elements) {
    if (!elements?.length) {
      return '        <!-- No elements to export -->'
    }

    return elements.map(element => {
      const styleStr = styleHelpers.objectToStyleString(element.style)
      
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
          return `        <div style="${styleStr}">${element.text || 'Text'}</div>`
        case ELEMENT_TYPES.BUTTON:
          return `        <button style="${styleStr}">${element.text || 'Button'}</button>`
        case ELEMENT_TYPES.IMAGE:
          return `        <img src="${element.src || ''}" style="${styleStr}" alt="${element.alt || 'Image'}" />`
        case ELEMENT_TYPES.INPUT:
          return `        <input type="text" style="${styleStr}" placeholder="${element.placeholder || element.text || 'Input'}" />`
        case ELEMENT_TYPES.TEXTAREA:
          return `        <textarea style="${styleStr}" placeholder="${element.placeholder || element.text || 'Textarea'}">${element.text || ''}</textarea>`
        case ELEMENT_TYPES.CARD:
          return `        <div style="${styleStr}">${element.text || 'Card Content'}</div>`
        case ELEMENT_TYPES.SECTION:
          const childrenHTML = element.children ? this.generateElementsHTML(element.children) : ''
          return `        <section style="${styleStr}">\n${childrenHTML}\n        </section>`
        default:
          return `        <div style="${styleStr}">${element.text || 'Element'}</div>`
      }
    }).join('\n')
  },

  generateElementsJSX(elements) {
    if (!elements?.length) {
      return '      {/* No elements to export */}'
    }

    return elements.map(element => {
      const styleObj = JSON.stringify(styleHelpers.convertStyleForJS(element.style))
      
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
          return `      <div style={${styleObj}}>${element.text || 'Text'}</div>`
        case ELEMENT_TYPES.BUTTON:
          return `      <button style={${styleObj}}>${element.text || 'Button'}</button>`
        case ELEMENT_TYPES.IMAGE:
          return `      <img src="${element.src || ''}" style={${styleObj}} alt="${element.alt || 'Image'}" />`
        case ELEMENT_TYPES.INPUT:
          return `      <input type="text" style={${styleObj}} placeholder="${element.placeholder || element.text || 'Input'}" />`
        case ELEMENT_TYPES.TEXTAREA:
          return `      <textarea style={${styleObj}} placeholder="${element.placeholder || element.text || 'Textarea'}">${element.text || ''}</textarea>`
        case ELEMENT_TYPES.CARD:
          return `      <div style={${styleObj}}>${element.text || 'Card Content'}</div>`
        case ELEMENT_TYPES.SECTION:
          const childrenJSX = element.children ? this.generateElementsJSX(element.children) : ''
          return `      <section style={${styleObj}}>\n${childrenJSX}\n      </section>`
        default:
          return `      <div style={${styleObj}}>${element.text || 'Element'}</div>`
      }
    }).join('\n')
  },

  generateElementsVue(elements) {
    if (!elements?.length) {
      return '    <!-- No elements to export -->'
    }

    return elements.map(element => {
      const styleObj = JSON.stringify(styleHelpers.convertStyleForJS(element.style))
      
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
          return `    <div :style="${styleObj}">${element.text || 'Text'}</div>`
        case ELEMENT_TYPES.BUTTON:
          return `    <button :style="${styleObj}">${element.text || 'Button'}</button>`
        case ELEMENT_TYPES.IMAGE:
          return `    <img src="${element.src || ''}" :style="${styleObj}" alt="${element.alt || 'Image'}" />`
        case ELEMENT_TYPES.INPUT:
          return `    <input type="text" :style="${styleObj}" placeholder="${element.placeholder || element.text || 'Input'}" />`
        case ELEMENT_TYPES.TEXTAREA:
          return `    <textarea :style="${styleObj}" placeholder="${element.placeholder || element.text || 'Textarea'}">${element.text || ''}</textarea>`
        case ELEMENT_TYPES.CARD:
          return `    <div :style="${styleObj}">${element.text || 'Card Content'}</div>`
        case ELEMENT_TYPES.SECTION:
          const childrenVue = element.children ? this.generateElementsVue(element.children) : ''
          return `    <section :style="${styleObj}">\n${childrenVue}\n    </section>`
        default:
          return `    <div :style="${styleObj}">${element.text || 'Element'}</div>`
      }
    }).join('\n')
  },

  generateExternalCSS(elements) {
    let css = ''
    let elementIndex = 0
    
    const processElement = (element) => {
      if (element.style && Object.keys(element.style).length > 0) {
        css += `    .element-${elementIndex} { ${styleHelpers.objectToStyleString(element.style)} }\n`
        elementIndex++
      }
      
      if (element.children) {
        element.children.forEach(processElement)
      }
    }
    
    elements?.forEach(processElement)
    
    return css
  }
}