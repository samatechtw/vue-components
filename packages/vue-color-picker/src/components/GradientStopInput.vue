<template>
  <input
    class="gradient-stop-input"
    type="number"
    min="0"
    max="100"
    step="1"
    :value="gradientColor.stop"
    @input="onInput"
    @blur="emit('blur')"
  />
</template>

<script lang="ts" setup>
import { IGradientColor } from '../types'

defineProps<{
  gradientColor: IGradientColor
}>()

const emit = defineEmits<{
  (e: 'update', stop: number): void
  (e: 'blur'): void
}>()

const onInput = (e: Event) => {
  const { value } = e.target as HTMLInputElement
  const formattedStop = formatStop(value)
  emit('update', formattedStop)
}

const formatStop = (input: string): number => {
  let parsedInput = parseInt(input)
  if (Number.isNaN(parsedInput) || parsedInput < 0) {
    parsedInput = 0
  } else if (parsedInput > 100) {
    parsedInput = 100
  }
  return parsedInput
}
</script>

<style lang="postcss" scoped>
.gradient-stop-input {
  width: 100%;
  height: 26px;
  padding: 0 12px;
  margin-left: 8px;
  border: none;
  color: #fff;
  background: #2e333a;
}
</style>
