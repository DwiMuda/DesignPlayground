<style scoped>
.canvas-element {
  display: inline-block;
  transition: all 0.1s ease;
  user-select: none;
  box-sizing: border-box;
  min-width: 20px;
  min-height: 20px;
}

.canvas-element:hover {
  outline: 2px dashed #007bff;
  outline-offset: 1px;
}

.canvas-element.selected {
  outline: 2px solid #007bff;
  outline-offset: 1px;
}

.canvas-element.dragging {
  opacity: 0.8;
  cursor: grabbing !important;
  z-index: 1000 !important;
}

/* Element Content */
.element-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}

/* Selection Indicator */
.selection-indicator {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  pointer-events: none;
  border: 2px solid #007bff;
  border-radius: 2px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { border-color: #007bff; }
  50% { border-color: #0056b3; }
  100% { border-color: #007bff; }
}

/* Element Type Specific Styles */
.element-button .element-content {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s ease;
}

.element-button .element-content:hover:not(.dragging) {
  background: #0056b3;
}

.element-text .element-content {
  padding: 8px;
  min-height: 20px;
  min-width: 60px;
  color: #333;
  font-size: 14px;
  line-height: 1.4;
}

.element-heading .element-content {
  padding: 12px 8px;
  min-height: 24px;
  min-width: 80px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}

.element-paragraph .element-content {
  padding: 8px;
  min-height: 40px;
  min-width: 100px;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

.element-image .element-content {
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6c757d;
}

.element-image .element-content::before {
  content: '🖼️ Image';
}

/* Focus styles for accessibility */
.element-button .element-content:focus {
  outline: 2px solid #0056b3;
  outline-offset: 1px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .canvas-element {
    min-width: 30px;
    min-height: 30px;
  }
  
  .element-button .element-content {
    padding: 10px 18px;
    font-size: 16px;
  }
}
</style>