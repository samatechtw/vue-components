<template>
  <div class="color-picker" :class="{ light: isLightTheme, gradient: isGradient }">
    <div class="picker-col" :style="{ width: totalWidth + 'px' }">
      <div class="color-set">
        <Saturation
          ref="saturation"
          :color="rgbString"
          :hsv="hsv"
          :size="hueHeight"
          @selectSaturation="selectSaturation"
        />
        <Hue
          ref="hue"
          :hsv="hsv"
          :width="hueWidth"
          :height="hueHeight"
          @selectHue="selectHue"
        />
        <Alpha
          ref="alpha"
          :color="rgbString"
          :rgba="rgba"
          :width="hueWidth"
          :height="hueHeight"
          @selectAlpha="selectAlpha"
        />
      </div>
      <div class="color-row" :style="{ height: previewHeight + 'px' }">
        <Preview
          v-if="!isGradient"
          :color="rgbaString"
          :width="previewWidth"
          :height="previewHeight"
        />
        <ColorPickerButton
          v-if="!forceNonGradient"
          class="add-gradient-color"
          :class="{ gradient: isGradient }"
          @click="addGradient(rgbaString, c.themeVar)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            class="plus"
          >
            <!-- eslint-disable max-len -->
            <path
              fill="white"
              d="M16 2A14.172 14.172 0 0 0 2 16a14.172 14.172 0 0 0 14 14a14.172 14.172 0 0 0 14-14A14.172 14.172 0 0 0 16 2Zm8 15h-7v7h-2v-7H8v-2h7V8h2v7h7Z"
            />
            <path fill="#6a5cf5" d="M24 17h-7v7h-2v-7H8v-2h7V8h2v7h7v2z" />
            <!-- eslint-enable max-len -->
          </svg>
          {{ copy?.gradient ?? 'Gradient' }}
        </ColorPickerButton>
      </div>
      <Box name="HEX" :color="modelHex" @inputColor="inputHex" />
      <Box name="RGBA" :color="modelRgba" @inputColor="inputRgba" />
      <div class="select-wrap">
        <ColorPickerButton class="color-select" @click="emitResult">
          {{ copy?.select ?? 'Select' }}
        </ColorPickerButton>
        <Trash class="clear-color" @click="clearColor" />
      </div>
      <!-- Selected theme colors -->
      <div class="theme-colors">
        <div v-if="selectedThemeColors.length" class="theme-color-grid">
          <div
            v-for="variable in selectedThemeColors"
            :key="variable.key"
            class="theme-color-cell"
            :style="{ 'background-color': variable.value }"
            @click="selectThemeColor(variable)"
          />
        </div>
        <div v-else class="theme-color-empty">
          {{ copy?.noThemeColors ?? 'No theme colors' }}
        </div>
      </div>
    </div>
    <div v-if="isGradient" class="picker-col" :style="{ width: totalWidth + 'px' }">
      <Gradient
        :selectedIndex="selectedIndex"
        :gradientType="gradientType"
        :gradientDegree="gradientDegree"
        :gradientColors="gradientColors"
        :computedGradient="computedGradient.raw"
        :computedGradientForBar="computedGradientForBar"
        :copy="copy"
        @select="selectGradientColor"
        @update:type="updateGradientType"
        @update:degree="updateDegree"
        @update:stop="updateStop"
        @blur:stop="sortGradientColors"
        @release:barHandle="sortGradientColors"
        @delete="deleteColor"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref, toRefs } from 'vue'
import Trash from './Trash.vue'
import Saturation from './Saturation.vue'
import Hue from './Hue.vue'
import Alpha from './Alpha.vue'
import Preview from './Preview.vue'
import Gradient from './Gradient.vue'
import Box from './Box.vue'
import ColorPickerButton from './ColorPickerButton.vue'
import {
  colorCodeToRgbaString,
  normalizeHex,
  ResolveThemeVarFn,
  rgb2hex,
  setColorValue,
} from '../util'
import {
  GradientType,
  IHsv,
  IPickerColor,
  IPickerText,
  IRgba,
  IThemeColor,
  IThemedGradient,
} from '../types'
import { IUpdateGradientStopParams, useGradient } from '../use'

const hueWidth = 15
const hueHeight = 152
const previewHeight = 26
const totalWidth = hueHeight + (hueWidth + 8) * 2
const previewWidth = totalWidth - previewHeight

const props = withDefaults(
  defineProps<{
    color?: string
    gradient?: string
    // Hack to force non-gradient color for ProseMirror editor.
    // If we implement gradient colors for ProseMirror selections, this can be removed
    forceNonGradient?: boolean
    theme?: string
    colorsDefault?: string[]
    resolveThemeVar?: ResolveThemeVarFn
    selectedThemeColors: IThemeColor[]
    copy?: IPickerText
  }>(),
  {
    color: '#000000',
    gradient: undefined,
    theme: 'dark',
    resolveThemeVar: () => undefined,
    colorsDefault: () => [
      /*
      '#000000',
      '#FFFFFF',
      '#FF1900',
      '#F47365',
      '#FFB243',
      '#FFE623',
      '#6EFF2A',
      '#1BC7B1',
      '#00BEFF',
      '#2E81FF',
      '#5D61FF',
      '#FF89CF',
      '#FC3CAD',
      '#BF3DCE',
      '#8E00A7',
      'rgba(0,0,0,0)',
      */
    ],
  },
)
const { color, gradient, forceNonGradient, theme, resolveThemeVar } = toRefs(props)
const emit = defineEmits<{
  (e: 'selectColor', color: IPickerColor | undefined): void
  (e: 'update', color: IPickerColor | IThemedGradient | undefined): void
  (e: 'applyGradient', gradient: IThemedGradient | undefined): void
}>()

interface IColor {
  r: number
  g: number
  b: number
  a: number
  h: number
  s: number
  v: number
  themeVar: string | undefined
}

const modelRgba = ref('')
const modelHex = ref('')
const c = reactive<IColor>({
  r: 0,
  g: 0,
  b: 0,
  a: 1,
  h: 0,
  s: 0,
  v: 0,
  themeVar: undefined,
})
const saturation = ref()
const hue = ref()
const alpha = ref()

const {
  selectedIndex,
  gradientType,
  gradientDegree,
  gradientColors,
  computedGradient,
  computedGradientForBar,
  addGradientColor,
  updateGradientDegree,
  updateSelectedGradientColor,
  updateGradientStop,
  sortGradientColors,
  deleteGradientColor,
} = useGradient({
  gradient: gradient.value,
  resolveThemeVar: resolveThemeVar.value,
})

const isGradient = computed(() => gradientColors.value.length > 1)

const isLightTheme = computed(() => theme.value === 'light')
const rgba = computed<IRgba>(() => ({
  r: c.r,
  g: c.g,
  b: c.b,
  a: c.a,
}))
const hsv = computed<IHsv>(() => ({
  h: c.h,
  s: c.s,
  v: c.v,
}))

const rgbString = computed(() => {
  return `rgb(${c.r}, ${c.g}, ${c.b})`
})
const rgbaStringShort = computed(() => {
  return `${c.r}, ${c.g}, ${c.b}, ${c.a}`
})
const rgbaString = computed(() => {
  return `rgba(${rgbaStringShort.value})`
})
const hexString = computed(() => {
  return rgb2hex(rgba.value, true)
})

const colorEmit = () => ({
  rgba: rgba.value,
  hsv: hsv.value,
  hex: modelHex.value,
  themeVar: c.themeVar,
})

const clearColor = () => {
  if (isGradient.value) {
    emit('applyGradient', undefined)
  } else {
    emit('selectColor', undefined)
  }
}

const emitUpdate = () => {
  if (isGradient.value) {
    emit('update', computedGradient.value)
  } else {
    emit('update', colorEmit())
  }
}

const addGradient = (rgba: string, themeVar?: string) => {
  addGradientColor(rgba, themeVar)
  emitUpdate()
}

const updateGradientType = (gradType: GradientType) => {
  gradientType.value = gradType
  emitUpdate()
}

const updateDegree = (degree: number) => {
  updateGradientDegree(degree)
  emitUpdate()
}

const updateStop = (params: IUpdateGradientStopParams) => {
  updateGradientStop(params)
  emitUpdate()
}

const deleteColor = (index: number) => {
  deleteGradientColor(index)
  emitUpdate()
}

const selectSaturation = (color: IRgba) => {
  const { r, g, b, h, s, v } = setColorValue(color)
  Object.assign(c, { r, g, b, h, s, v, themeVar: undefined })
  setText()
  updateSelectedGradientColor(rgbaString.value)
  emitUpdate()
}

const selectHue = async (color: any) => {
  const { r, g, b, h } = setColorValue(color)
  // Retain previous saturation
  Object.assign(c, { r, g, b, h, themeVar: undefined })
  setText()
  updateSelectedGradientColor(rgbaString.value)
  await rerender()
  saturation.value.recalculateSaturation()
  emitUpdate()
}

const selectAlpha = (a: any) => {
  c.a = a
  c.themeVar = undefined
  setText()
  updateSelectedGradientColor(rgbaString.value)
  emitUpdate()
}

const inputHex = async (color: string) => {
  const normalized = normalizeHex(color)
  const { r, g, b, a, h, s, v } = setColorValue(normalized ?? color)
  Object.assign(c, { r, g, b, a, h, s, v, themeVar: undefined })
  modelHex.value = color
  modelRgba.value = rgbaStringShort.value
  updateSelectedGradientColor(rgbaString.value)
  await rerender()
  emitUpdate()
}

const rerender = async () => {
  await nextTick()
  // TODO -- fix this so it uses reactivity
  saturation.value.renderColor()
  saturation.value.renderSlide()
  hue.value.renderSlide()
}

const inputRgba = async (color: string) => {
  const { r, g, b, a, h, s, v } = setColorValue(color)
  Object.assign(c, { r, g, b, a, h, s, v, themeVar: undefined })
  modelHex.value = hexString.value
  modelRgba.value = color
  updateSelectedGradientColor(rgbaString.value)
  await rerender()
  emitUpdate()
}

const setText = () => {
  modelHex.value = hexString.value
  modelRgba.value = rgbaStringShort.value
}
const selectColor = async (color: string, themeVar?: string) => {
  const { r, g, b, a, h, s, v } = setColorValue(color)
  Object.assign(c, { r, g, b, a, h, s, v, themeVar })
  setText()
  await rerender()
  emitUpdate()
}

const selectGradientColor = async (index: number) => {
  const gradientColor = gradientColors.value[index]
  await selectColor(gradientColor.rgba)
  selectedIndex.value = index
}

const selectThemeColor = async (themeVar: IThemeColor) => {
  const rgba = colorCodeToRgbaString(themeVar.value)
  await selectColor(rgba, themeVar.key)
  if (isGradient.value) {
    updateSelectedGradientColor(rgba, themeVar.key)
  } else {
    emit('selectColor', colorEmit())
  }
}

const emitResult = () => {
  if (isGradient.value) {
    emit('applyGradient', computedGradient.value)
  } else {
    emit('selectColor', colorEmit())
  }
}

onMounted(async () => {
  let initialColor = gradientColors.value[0]?.rgba || color.value
  if (forceNonGradient.value) {
    initialColor = color.value
  }
  const resolved = resolveThemeVar.value(initialColor) ?? ''
  Object.assign(c, setColorValue(resolved))
  if (initialColor !== resolved) {
    c.themeVar = initialColor.match(/\$\{(.*?)\}/)?.[1] || undefined
  }
  setText()
  await rerender()
  emitUpdate()
})
</script>

<style lang="postcss" scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  font-family: var(--color-picker-font-text, Helvetica);
  color: var(--color-picker-color-light1, #f8f5f0);
  background: #1d2024;
  border-radius: 4px;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
  z-index: var(--color-picker-z-index);
  position: absolute;
}
.clear-color :deep(g) {
  fill: #b7436a;
}
.color-picker.gradient {
  flex-direction: row;
}
.color-picker.light {
  background: #f7f8f9;
}
.color-type .name {
  background: #e7e8e9;
}
.color-type .value {
  color: #666;
  background: #eceef0;
}
.theme-color-cell {
  border-color: #313233;
}
.picker-col {
  padding: 10px;
  box-sizing: initial;
}
canvas {
  display: flex;
  height: 100%;
  width: 100%;
  aspect-ratio: 1;
}
.color-set {
  display: flex;
}
.apply-gradient-button {
  width: 100%;
  margin-top: 8px;
}
.color-row {
  display: flex;
  width: 100%;
  margin-top: 6px;
}
.color-row > canvas {
  width: v-bind(forceNonGradient ? '100%': '50%');
}
.select-wrap {
  display: flex;
  margin: 8px 6px 0 0;
  width: 100%;
}
.select-wrap :deep(svg) {
  width: 22px;
  height: 22px;
  margin-left: 6px;
  cursor: pointer;
}
.color-select {
  padding: 6px 4px;
  flex-grow: 1;
}
.add-gradient-color {
  padding: 6px 4px;
  margin-left: 6px;
  flex-grow: 1;
}
.plus {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
.add-gradient-color.gradient {
  width: 50%;
  margin-left: 0;
}

.theme-colors {
  margin-top: 12px;
}
.theme-color-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: -8px 0 0 -8px;
}
.theme-color-cell {
  width: 17px;
  height: 17px;
  margin: 8px 0 0 8px;
  box-shadow: 0 1px 4px 1px rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.theme-color-cell:hover {
  transform: scale(1.1);
}
.theme-color-empty {
  font-family: var(--color-picker-font-text);
  color: var(--color-picker-color-light3, #a1a1aa);
  font-size: 13px;
}
</style>
