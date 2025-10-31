export const ELEMENT_TYPES = {
    TEXT: 'text',
    BUTTON: 'button',
    IMAGE: 'image',
    INPUT: 'input',
    TEXTAREA: 'textarea',
    CARD: 'card',
    SECTION: 'section'
  }
  
  export const DEFAULT_STYLES = {
    [ELEMENT_TYPES.TEXT]: {
      padding: '12px 16px',
      color: '#333333',
      fontSize: '16px',
      lineHeight: '1.5',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    [ELEMENT_TYPES.BUTTON]: {
      padding: '12px 24px',
      backgroundColor: '#3498db',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    [ELEMENT_TYPES.IMAGE]: {
      width: '200px',
      height: '150px',
      borderRadius: '8px',
      objectFit: 'cover'
    },
    [ELEMENT_TYPES.INPUT]: {
      padding: '12px 16px',
      border: '2px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      width: '200px'
    },
    [ELEMENT_TYPES.TEXTAREA]: {
      padding: '12px 16px',
      border: '2px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      width: '200px',
      height: '100px',
      resize: 'vertical'
    },
    [ELEMENT_TYPES.CARD]: {
      padding: '24px',
      backgroundColor: '#ffffff',
      color: '#333333',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      minHeight: '120px'
    },
    [ELEMENT_TYPES.SECTION]: {
      padding: '40px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      marginBottom: '20px'
    }
  }
  
  export const ELEMENT_ICONS = {
    [ELEMENT_TYPES.TEXT]: '📝',
    [ELEMENT_TYPES.BUTTON]: '🔘',
    [ELEMENT_TYPES.IMAGE]: '🖼️',
    [ELEMENT_TYPES.INPUT]: '📥',
    [ELEMENT_TYPES.TEXTAREA]: '📄',
    [ELEMENT_TYPES.CARD]: '🎴',
    [ELEMENT_TYPES.SECTION]: '📑'
  }
  
  export const ELEMENT_NAMES = {
    [ELEMENT_TYPES.TEXT]: 'Text',
    [ELEMENT_TYPES.BUTTON]: 'Button',
    [ELEMENT_TYPES.IMAGE]: 'Image',
    [ELEMENT_TYPES.INPUT]: 'Input Field',
    [ELEMENT_TYPES.TEXTAREA]: 'Text Area',
    [ELEMENT_TYPES.CARD]: 'Card',
    [ELEMENT_TYPES.SECTION]: 'Section'
  }