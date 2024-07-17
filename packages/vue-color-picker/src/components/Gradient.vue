<template>
  <div class="gradient">
    <div class="gradient-preview" :class="{ [gradientType]: gradientType }" />
    <GradientBar
      :selectedIndex="selectedIndex"
      :gradientColors="gradientColors"
      :computedGradientForBar="computedGradientForBar"
      @select="emit('select', $event)"
      @update:stop="emit('update:stop', $event)"
      @blur:stop="emit('blur:stop')"
      @release:handle="emit('release:barHandle')"
    />
    <div class="gradient-colors">
      <div class="gradient-color-labels">
        <div class="color-label g-label">#</div>
        <div class="stop-label g-label">
          {{ copy?.stop ?? 'Stop' }}
        </div>
        <div class="delete-label" />
      </div>
      <GradientColor
        v-for="(gradientColor, index) in gradientColors"
        :key="index"
        :gradientColor="gradientColor"
        :selected="selectedIndex === index"
        @select="emit('select', index)"
        @update:stop="updateStop(index, $event)"
        @blur:stop="emit('blur:stop')"
        @delete="emit('delete', index)"
      />
    </div>
    <div class="gradient-types">
      <div
        v-for="typeValue in GradientTypeValues"
        :key="typeValue"
        class="gradient-type"
        :class="{ active: gradientType === typeValue }"
        @click="emit('update:type', typeValue)"
      >
        {{ copy?.[typeValue] ?? defaultText[typeValue] }}
      </div>
    </div>
    <GradientDegree
      v-if="isLinearGradient"
      :degree="gradientDegree"
      :resetText="copy?.resetDegree ?? 'Reset'"
      @update="emit('update:degree', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import GradientColor from './GradientColor.vue'
import GradientBar from './GradientBar.vue'
import GradientDegree from './GradientDegree.vue'
import { GradientType, GradientTypeValues, IGradientColor } from '../types'
import { IUpdateGradientStopParams } from '../use'
import { IPickerText } from '../types/i-picker-text'

const props = defineProps<{
  selectedIndex: number
  gradientType: GradientType
  gradientDegree: number
  gradientColors: IGradientColor[]
  computedGradient: string
  computedGradientForBar: string
  copy: IPickerText | undefined
}>()

const defaultText = {
  'linear-gradient': 'Linear',
  'radial-gradient': 'Radial',
  'conic-gradient': 'Conic',
}

const { selectedIndex, gradientType, gradientColors } = toRefs(props)

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'select', index: number): void
  (e: 'update:type', gradientType: GradientType): void
  (e: 'update:degree', degree: number): void
  (e: 'update:stop', params: IUpdateGradientStopParams): void
  (e: 'blur:stop'): void
  (e: 'release:barHandle'): void
  (e: 'delete', index: number): void
}>()

const isLinearGradient = computed(() => gradientType.value === GradientType.Linear)

const updateStop = (index: number, stop: number) => {
  emit('update:stop', {
    index,
    stop,
  })
}
</script>

<style lang="postcss" scoped>
.gradient-preview {
  width: 50%;
  padding-bottom: 50%;
  margin: 8px auto 0 auto;
  background: v-bind(computedGradient);
}

.gradient-color-labels {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.g-label {
  font-family: var(--color-picker-font-text);
  font-weight: 500;
  font-size: 14px;
}
.color-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  flex-shrink: 0;
}
.stop-label {
  flex-grow: 1;
  text-align: center;
}
.delete-label {
  width: 18px;
  margin-left: 8px;
}

.gradient-types {
  display: flex;
  flex-direction: row;
}
.gradient-type {
  font-family: var(--color-picker-font-text);
  font-size: 14px;
  padding: 4px 8px;
  margin-top: 8px;
  color: var(--color-picker-color-light2, #dddfe2);
  border: 1px solid var(--color-picker-color-border, #606470);
  cursor: pointer;
  text-align: center;
  flex-grow: 1;
  user-select: none;
}
.gradient-type.active {
  color: white;
  background-color: var(--color-picker-color-border, #606470);
  border-right: none;
}
.gradient-type:first-of-type {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.gradient-type:last-of-type {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  border-left: none;
}
</style>
