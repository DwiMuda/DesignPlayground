// Element Types
export const ELEMENT_TYPES = {
  TEXT: 'text',
  BUTTON: 'button',
  HEADING: 'heading',
  IMAGE: 'image',
  INPUT: 'input',
  TEXTAREA: 'textarea',
  CARD: 'card',
  DIVIDER: 'divider',
  LINK: 'link',
  CONTAINER: 'container',
  SECTION: 'section',
  PARAGRAPH: 'paragraph',
  ICON: 'icon'
}

// Default Properties
export const DEFAULT_PROPERTIES = {
  text: {
    text: 'Sample text',
    style: {
      padding: '12px',
      color: '#333333',
      fontSize: '16px',
      backgroundColor: 'transparent'
    }
  },
  button: {
    text: 'Click me',
    style: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px'
    }
  },
  heading: {
    text: 'Heading',
    style: {
      padding: '16px 12px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50'
    }
  }
}

// Get element display name
export const getElementName = (elementType) => {
  const names = {
    text: 'Text',
    button: 'Button',
    heading: 'Heading',
    image: 'Image',
    input: 'Input',
    textarea: 'Textarea',
    card: 'Card',
    divider: 'Divider',
    link: 'Link',
    container: 'Container',
    section: 'Section',
    paragraph: 'Paragraph',
    icon: 'Icon'
  }
  return names[elementType] || 'Element'
}

// Default styles
export const DEFAULT_STYLES = {
  text: {
    padding: '12px',
    color: '#333333',
    fontSize: '16px',
    backgroundColor: 'transparent'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px'
  }
}