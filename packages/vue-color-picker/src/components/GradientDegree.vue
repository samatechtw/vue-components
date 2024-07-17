<template>
  <div class="gradient-degree">
    <div ref="knob" class="degree-knob" @mousedown="onMouseDown" @click="onRotate">
      <span class="degree-indicator" />
    </div>
    <input
      v-model="gradientDegree"
      class="gradient-degree-input"
      @input="onInput"
      @keydown="onKeyDown"
      @blur="onBlur"
    />
    <ColorPickerButton class="reset-gradient-degree-button" @click="onKnobRotate(0)">
      {{ resetText }}
    </ColorPickerButton>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import ColorPickerButton from './ColorPickerButton.vue'
import { useDegreeKnob } from '../use'

const props = defineProps<{
  degree: number
  resetText: string
}>()

const { degree } = toRefs(props)

const emit = defineEmits<{
  (e: 'update', degree: number): void
}>()

const gradientDegree = ref(`${degree.value}°`)

const onKnobRotate = (degree: number) => {
  gradientDegree.value = `${degree}°`
  emit('update', degree)
}

const { knob, onMouseDown, onRotate } = useDegreeKnob({
  update: onKnobRotate,
})

const onInput = (e: Event) => {
  const { value } = e.target as HTMLInputElement
  const formattedValue = formatDegree(value)
  emit('update', formattedValue)
}

const onKeyDown = (e: KeyboardEvent) => {
  const { key } = e
  if (key === 'ArrowUp') {
    onKnobRotate((degree.value + 1) % 360)
  } else if (key === 'ArrowDown') {
    onKnobRotate((degree.value - 1) % 360)
  }
}

const onBlur = (e: FocusEvent) => {
  const { value } = e.target as HTMLInputElement
  const formattedValue = formatDegree(value)
  gradientDegree.value = `${formattedValue}°`
}

const formatDegree = (value: string): number => {
  const parsedValue = parseInt(value) % 360
  return isValidDegree(parsedValue) ? parsedValue : 0
}

const isValidDegree = (degree: number): boolean => {
  if (Number.isNaN(degree)) {
    return false
  } else {
    return -360 <= degree && degree <= 360
  }
}

const cssDegree = computed(() => parseInt(gradientDegree.value) + 'deg')
</script>

<style lang="postcss" scoped>
.gradient-degree {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
}
.gradient-degree-input {
  width: 100%;
  height: 26px;
  padding: 0 12px;
  margin-left: 8px;
  border: none;
  color: #fff;
  background: #2e333a;
}

.degree-knob {
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transform: rotate(v-bind(cssDegree));
}
.degree-indicator {
  width: 6px;
  height: 6px;
  position: absolute;
  top: 4px;
  background-color: white;
  border-radius: 50%;
}

.reset-gradient-degree-button {
  width: 48px;
  margin-left: 8px;
}
</style>
