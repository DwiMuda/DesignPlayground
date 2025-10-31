<template>
  <div class="widget" :style="widget.style" @click.stop="selectWidget">
    <template v-if="widget.type === 'text'">{{ widget.text }}</template>
    <template v-if="widget.type === 'button'"
      ><button :style="widget.style">{{ widget.text }}</button></template
    >
    <template v-if="widget.type === 'image'"
      ><img :src="widget.src" :style="widget.style"
    /></template>
  </div>
</template>

<script setup>
import { useCanvasStore } from "../../stores/canvas";
const props = defineProps({ widget: Object });
const store = useCanvasStore();

const selectWidget = () => store.selectElement(props.widget);
</script>

<style scoped>
.widget {
  margin-bottom: 5px;
  cursor: pointer;
}
</style>
