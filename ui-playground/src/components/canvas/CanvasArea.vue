<style scoped>
.canvas {
  flex: 1;
  position: relative;
  background: #fff;
  overflow: hidden;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.canvas.show-grid {
  background: #fafafa;
}

.canvas.is-dragging {
  background: #f0f8ff;
  border: 2px dashed #007bff;
}

.canvas.has-selection {
  cursor: default;
}

/* Grid Overlay */
.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: 
    linear-gradient(90deg, rgba(0, 123, 255, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(0, 123, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.6;
}

/* Drop Zone Indicator */
.drop-zone-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 123, 255, 0.05);
  border: 3px dashed #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
  animation: pulse-drop 1.5s infinite;
}

.drop-message {
  text-align: center;
  color: #007bff;
  font-weight: 500;
}

.drop-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.drop-message p {
  margin: 0;
  font-size: 16px;
}

@keyframes pulse-drop {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Canvas Controls */
.canvas-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
}

.zoom-controls,
.view-controls {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 4px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
  color: #555;
}

.control-btn:hover:not(:disabled) {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.active {
  background: #007bff;
  color: white;
}

.zoom-level {
  min-width: 60px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  padding: 0 8px;
}

/* Canvas Stats */
.canvas-stats {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 12px;
  color: #333;
  font-weight: 600;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 40px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .canvas-controls {
    bottom: 10px;
    right: 10px;
  }
  
  .canvas-stats {
    bottom: 10px;
    left: 10px;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .zoom-level {
    min-width: 50px;
    font-size: 12px;
  }
}

/* Smooth zoom transitions */
.canvas > * {
  transition: transform 0.1s ease;
}
</style>