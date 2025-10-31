<template>
  <div class="column">
    <Widget
      v-for="widget in column.widgets"
      :key="widget.id"
      :widget="widget"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup>
import Widget from "./common/Widget.vue";
const props = defineProps({ column: Object });
</script>

<style scoped>
.column {
  border: 1px dotted #aaa;
  padding: 5px;
  margin-bottom: 5px;
  min-height: 50px;
}
</style>
