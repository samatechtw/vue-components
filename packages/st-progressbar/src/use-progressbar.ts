import { computed, ComputedRef, reactive, Ref, ref } from 'vue'

export interface IUseListDrag {
  dragData: ComputedRef<IDragData | undefined>
  startDrag(e: MouseEvent, initialValue: number): IDragData
  clickBar(e: MouseEvent, initialValue: number): void
  drag(e: MouseEvent): void
  stopDrag(e?: MouseEvent): void
}

export interface IUseProgressBarOptions {
  id: ComputedRef<string>
  min: ComputedRef<number>
  max: ComputedRef<number>
  step: ComputedRef<number>
  onChange: (value: number, id: string) => void
}

export interface IDragData {
  initialValue: number
  value: number
  startX: number
  width: number
}

const dragMap = reactive<Record<string, IDragData | undefined>>({})

const valueFromData = (
  opts: IUseProgressBarOptions,
  initialValue: number,
  width: number,
  clientX: number,
  startX: number,
): number => {
  const max = opts.max.value
  const min = opts.min.value
  const step = opts.step.value
  const diff = (clientX - startX) / (width ?? 100)
  const newVal = initialValue + (max - min) * diff
  const clamped = Math.max(min, Math.min(max, newVal))

  // Calculate the nearest step but switch to the next step once past halfway
  const stepBelow = Math.floor(clamped / step) * step
  const stepAbove = stepBelow + step
  const midpoint = stepBelow + step / 2

  const clampedStep = clamped < midpoint ? stepBelow : stepAbove
  const roundedStep = Math.round(100000 * clampedStep) / 100000
  return roundedStep
}

export const useProgressBar = (options: IUseProgressBarOptions): IUseListDrag => {
  const { id, min, max, onChange } = options

  const startDrag = (e: MouseEvent, initialValue: number): IDragData => {
    document.addEventListener('mousemove', drag)
    document.addEventListener('mouseup', stopDrag)
    const width = document.getElementById(id.value)?.offsetWidth ?? 100
    const data = {
      initialValue,
      value: initialValue,
      startX: e.clientX,
      width,
    }
    dragMap[id.value] = data
    return data
  }

  const clickBar = (e: MouseEvent, initialValue: number) => {
    const el = document.getElementById(id.value)
    if (el) {
      const bound = el.getBoundingClientRect()
      const initialPercent = (initialValue - min.value) / (max.value - min.value)
      const startX = bound.left + bound.width * initialPercent

      const roundedStep = valueFromData(
        options,
        initialValue,
        bound.width,
        e.clientX,
        startX,
      )
      const data = startDrag(e, roundedStep)
      data.value = roundedStep
      onChange(roundedStep, id.value)
    }
  }

  const drag = (e: MouseEvent) => {
    const data = dragMap[id.value]
    if (data) {
      const roundedStep = valueFromData(
        options,
        data.initialValue,
        data.width,
        e.clientX,
        data.startX,
      )
      if (roundedStep !== data.value) {
        data.value = roundedStep
        onChange(roundedStep, id.value)
      }
    }
  }

  const stopDrag = (_e?: MouseEvent) => {
    dragMap[id.value] = undefined
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('mouseup', stopDrag)
  }

  const dragData = computed(() => {
    return dragMap[id.value]
  })

  return {
    dragData,
    startDrag,
    clickBar,
    drag,
    stopDrag,
  }
}
