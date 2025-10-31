<template>
  <div class="editor" v-if="selected">
    <h4>Properties</h4>
    <div v-if="selected.type === 'text' || selected.type === 'button'">
      <label>Text:</label>
      <input type="text" v-model="selected.text" />
    </div>
    <div v-if="selected.type === 'image'">
      <label>Image URL:</label>
      <input type="text" v-model="selected.src" />
    </div>
    <label>Background:</label>
    <input type="color" v-model="selected.style.background" />
    <label>Color:</label>
    <input type="color" v-model="selected.style.color" />
    <label>Border Radius:</label>
    <input type="range" min="0" max="50" v-model.number="borderRadius" />
    <button @click="remove">Delete</button>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useCanvasStore } from "../../stores/canvas";

const store = useCanvasStore();
const selected = computed(() => store.selected);

const borderRadius = computed({
  get: () => parseInt(selected.value?.style.borderRadius || 0),
  set: (val) => {
    if (selected.value) selected.value.style.borderRadius = val + "px";
  },
});

const remove = () => {
  if (selected.value) store.removeElement(selected.value.id);
};
</script>

<style scoped>
.editor {
  width: 250px;
  padding: 10px;
  background: #f5f5f5;
  border-left: 1px solid #ccc;
}
.editor input[type="text"],
.editor input[type="color"],
.editor input[type="range"] {
  width: 100%;
  margin-bottom: 5px;
}
button {
  background: #d9534f;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
