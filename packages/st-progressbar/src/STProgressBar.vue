<template>
  <div class="st-progressbar-wrap" :class="{ dragging: !!dragData }" :id="id">
    <div class="st-progressbar" @mousedown="clickBar($event, value)">
      <div
        class="progress-line"
        :style="{ width: `${calculatedPercent}%`, height: `${height}px` }"
      >
        <div class="progress-tooltip" @mousedown.stop="startDrag($event, value)">
          <span class="percent-value">{{ Math.round(value) }}</span>
          <span v-if="showPercent" class="percent-label">%</span>
        </div>
      </div>
    </div>
    <div class="labels">
      <div class="min">
        {{ p(min) }}
      </div>
      <slot name="label" />
      <div class="max">
        {{ p(max) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, toRefs } from 'vue'
import { useProgressBar } from './use-progressbar'

const props = withDefaults(
  defineProps<{
    id: string
    value: number
    min?: number
    max?: number
    step?: number
    showPercent?: boolean
    height?: number
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    height: 4,
    showPercent: true,
  },
)
const { id, value, min, max, step, showPercent } = toRefs(props)

const emit = defineEmits<{
  (e: 'change', value: number): void
}>()

const { dragData, clickBar, startDrag, stopDrag } = useProgressBar({
  id,
  min,
  max,
  step,
  onChange(value, id) {
    emit('change', value)
  },
})

const p = (val: number): string => {
  return showPercent.value ? `${val}%` : val.toString()
}

const calculatedPercent = computed(() => {
  return 100 * ((value.value - min.value) / (max.value - min.value))
})

onUnmounted(() => {
  stopDrag()
})
</script>

<style lang="postcss">
@import '../../component-utils/src/defines.postcss';

.st-progressbar-wrap {
  width: 100%;
}
.st-progressbar {
  width: 100%;
  background-color: var(--progress-background, $grey-200);
  cursor: pointer;
}

.progress-line {
  position: relative;
  background-color: var(--progress-bar, $color-light1);
  height: 4px;
}

.progress-tooltip {
  position: absolute;
  top: -40px;
  right: 0;
  transform: translateX(50%);
  min-width: 50px;
  padding: 5px 0 4px;
  text-align: center;
  background: white;
  user-select: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(151, 151, 151, 0.15);
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.15);
  border-radius: 40%;
  color: black;
  font-family: var(--st-component-title, $font-title);
  font-weight: 700;
  font-size: 17px;
  transition: background-color 0.2s ease;
  transition-property: background-color, box-shadow;

  &::after {
    position: absolute;
    content: ' ';
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--progress-tooltip, white);
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
  }
  &:hover {
    box-shadow: 0 2px 13px rgba(0, 0, 0, 0.18);
  }
}
.st-progressbar-wrap.dragging .progress-tooltip {
  top: -39px;
  background-color: var(--progress-tooltip-hover, $grey-100);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
.labels {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding-top: 3px;
  font-family: var(--st-component-title, $font-title);
  font-size: 15px;
  position: relative;
  user-select: none;
}
.min {
  margin-left: -2px;
}
.max {
  margin-right: -4px;
}

.percent-label {
  font-size: 14px;
}
</style>
