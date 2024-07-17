<template>
  <div class="gradient-color" :class="{ selected: selected }" @click="emit('select')">
    <div class="color-preview" :class="{ selected: selected }" />
    <GradientStopInput
      :gradientColor="gradientColor"
      @update="emit('update:stop', $event)"
      @blur="emit('blur:stop')"
    />
    <Trash class="g-delete-color" @click.stop="emit('delete')" />
  </div>
</template>

<script lang="ts" setup>
import { IGradientColor } from '../types'
import GradientStopInput from './GradientStopInput.vue'
import Trash from './Trash.vue'

defineProps<{
  gradientColor: IGradientColor
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'update:stop', stop: number): void
  (e: 'blur:stop'): void
  (e: 'delete'): void
}>()
</script>

<style lang="postcss" scoped>
.gradient-color {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
}
.gradient-color.selected {
  background-color: #656c76;
}

.color-preview {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  cursor: pointer;
  background-color: v-bind(gradientColor.rgba);
}

.g-delete-color {
  width: 18px;
  height: 18px;
  margin-left: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
