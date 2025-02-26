import { computed, ComputedRef, reactive, Ref, ref } from 'vue'

export interface IUseListDrag {
  dragData: ComputedRef<IDragData | undefined>
  startDrag(e: MouseEvent, initialValue: number): void
  drag(e: MouseEvent): void
  stopDrag(e?: MouseEvent): void
}

export interface IUseProgressBarOptions {
  id: string
  min: number
  max: number
  step: number
  onChange: (value: number, id: string) => void
}

export interface IDragData {
  initialValue: number
  value: number
  startX: number
  width: number
}

const dragMap = reactive<Record<string, IDragData | undefined>>({})

export const useProgressBar = (options: IUseProgressBarOptions): IUseListDrag => {
  const { id, min, max, step, onChange } = options

  const startDrag = (e: MouseEvent, initialValue: number) => {
    document.addEventListener('mousemove', drag)
    document.addEventListener('mouseup', stopDrag)
    const width = document.getElementById(id)?.offsetWidth ?? 100
    dragMap[id] = {
      initialValue,
      value: initialValue,
      startX: e.clientX,
      width,
    }
  }

  const drag = (e: MouseEvent) => {
    if (dragMap[id]) {
      const { initialValue, value, startX } = dragMap[id]
      const diff = (e.clientX - startX) / (dragMap[id]?.width ?? 100)
      const newVal = initialValue + (max - min) * diff
      const clamped = Math.max(min, Math.min(max, newVal))

      // Calculate the nearest step but switch to the next step once past halfway
      const stepBelow = Math.floor(clamped / step) * step
      const stepAbove = stepBelow + step
      const midpoint = stepBelow + step / 2

      const clampedStep = clamped < midpoint ? stepBelow : stepAbove
      const roundedStep = Math.round(100000 * clampedStep) / 100000

      if (roundedStep !== value) {
        dragMap[id].value = roundedStep
        onChange(roundedStep, id)
      }
    }
  }

  const stopDrag = (_e?: MouseEvent) => {
    dragMap[id] = undefined
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('mouseup', stopDrag)
  }

  const dragData = computed(() => {
    return dragMap[id]
  })

  return {
    dragData,
    startDrag,
    drag,
    stopDrag,
  }
}
