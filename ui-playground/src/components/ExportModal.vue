<template>
  <div v-if="show" class="modal" @click.self="close">
    <h3>Export HTML</h3>
    <textarea :value="generateHTML()" readonly></textarea>
    <button @click="copy">Copy</button>
    <button @click="close">Close</button>
  </div>
</template>

<script setup>
import { useCanvasStore } from "../stores/canvas";
import { ref } from "vue";

const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);
const store = useCanvasStore();

const generateHTML = () => {
  return store.sections
    .map((s) => {
      return s.columns
        .map((c) =>
          c.widgets
            .map((w) => {
              if (w.type === "text")
                return `<div style="${styleToString(w.style)}">${w.text}</div>`;
              if (w.type === "button")
                return `<button style="${styleToString(w.style)}">${
                  w.text
                }</button>`;
              if (w.type === "image")
                return `<img src="${w.src}" style="${styleToString(
                  w.style
                )}"/>`;
            })
            .join("")
        )
        .join("");
    })
    .join("");
};

const styleToString = (style) =>
  Object.entries(style || {})
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

const copy = () => {
  navigator.clipboard.writeText(generateHTML());
};
const close = () => emit("close");
</script>

<style scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  width: 500px;
  max-height: 80vh;
  overflow: auto;
}
textarea {
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
}
button {
  margin-right: 5px;
}
</style>
