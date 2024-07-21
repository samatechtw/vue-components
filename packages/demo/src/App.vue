<template>
  <div class="color-picker-demo" :style="{ background }">
    <div class="content-wrap">
      <ColorPicker
        :color="selectedColor"
        :gradient="selectedGradient"
        :forceNonGradient="false"
        :selectedThemeColors="themeColors"
        class="demo-picker"
        @selectColor="selectColor"
        @update="update"
        @applyGradient="applyGradient"
      />
    </div>
    <div class="footer" :class="{ light: isLight }">
      © SamaTech 2024. All rights reserved. Hosted on
      <a target="_blank" href="https://pubstud.io">PubStudio</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ColorPicker,
  IPickerColor,
  IThemedGradient,
  IThemeColor,
  IRgba,
} from '@samatech/vue-color-picker'
import '@samatech/vue-color-picker/dist/style.css'
import { computed, ref } from 'vue'

const selectedColor = ref<string | undefined>()
const selectedGradient = ref()
const themeColors = ref<IThemeColor[]>([])
const isLight = ref(true)

const background = computed(() => {
  return selectedColor.value ?? selectedGradient.value ?? '#f8f5f0'
})

const getRgba = (color: IPickerColor | undefined) => {
  if (color) {
    const { r, g, b, a } = color.rgba
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  return undefined
}

const checkLight = (rgba: IRgba) => {
  const { r, g, b } = rgba
  const a = 765 - (rgba.a ?? 1) * 765
  isLight.value = r + g + b + a > 280
}

const update = (color: IPickerColor | IThemedGradient | undefined) => {
  if (color && 'raw' in color) {
    selectedGradient.value = color.raw
    selectedColor.value = undefined
  } else {
    selectedColor.value = getRgba(color)
    selectedGradient.value = undefined
    if (color) {
      checkLight(color.rgba)
    }
  }
}

const addThemeColor = (color: string | undefined) => {
  if (color && !themeColors.value.find((c) => c.key === color)) {
    themeColors.value.push({ key: color, value: color })
  }
}

const selectColor = (color: IPickerColor | undefined) => {
  selectedColor.value = getRgba(color)
  selectedGradient.value = undefined
  addThemeColor(selectedColor.value)
}

const applyGradient = (gradient: IThemedGradient | undefined) => {
  selectedGradient.value = gradient?.raw
  selectedColor.value = undefined
}
</script>

<style lang="postcss">
html,
body {
  font-family: Helvetica, sans-serif;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: #f8f5f0;
}
html *,
body * {
  box-sizing: border-box;
}

h1 {
  font-family: Helvetica, sans-serif;
  font-weight: 600;
  font-size: 32px;
}

p {
  margin: 0;
}

a {
  color: unset;
  text-decoration: underline;
}

.noscroll {
  overflow: hidden;
}

.color-picker-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}
.picker-demo {
  position: relative;
}

.content-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  min-height: 100vh;
}

.footer {
  font-size: 12px;
  padding: 12px 0 8px;
  margin: auto auto 0;
  color: white;
}
.footer.light {
  color: black;
}
</style>
