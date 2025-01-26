<template>
  <div
    ref="multiselectRef"
    class="st-multiselect"
    :class="{ 'st-ms-disabled': disabled }"
    :data-toggle-id="dataToggleId"
    @click="toggleDropdown"
  >
    <div
      :ref="setToggleRef"
      class="st-ms-label"
      @mouseenter="tooltipMouseEnter"
      @mouseleave="tooltipMouseLeave"
    >
      <STInput
        v-if="searchActive"
        ref="searchRef"
        :modelValue="search"
        :isDisabled="disabled"
        name="search"
        class="st-ms-search"
        type="search"
        autocomplete="off"
        @update:modelValue="updateSearch"
        @keyup.enter.stop.prevent="searchEnter"
        @keydown="handleKeydown"
        @click.stop="toggleDropdown"
      />
      <div v-else-if="forceLabel ?? label" class="st-ms-label-text">
        {{ forceLabel ?? label }}
      </div>
      <div v-else class="st-ms-placeholder">
        {{ placeholder ?? '' }}
      </div>
      <div v-if="clearable && value" class="st-ms-clear" @click.stop="clear">
        <Cross class="st-ms-clear-icon" />
      </div>
      <div v-if="caret" class="st-ms-caret" :class="{ opened }"></div>
    </div>
    <Transition name="st-ms-slide">
      <div v-show="opened" ref="menuRef" class="st-ms-dropdown" :style="menuStyle">
        <div
          v-for="(l, index) in labels"
          :key="(l ?? index).toString()"
          class="ms-item"
          :class="{ 'st-highlight': searchActive && index === searchIndex }"
          @click="select(index)"
        >
          <slot v-if="customLabel" :label="l" :index="index"></slot>
          <div v-else>
            {{ l }}
          </div>
        </div>
        <slot v-if="customSlot" name="customSlot" />
        <div
          v-else-if="!labels.length"
          class="ms-item no-options"
          @click="emit('selectEmpty')"
        >
          {{ emptyText }}
        </div>
      </div>
    </Transition>
    <Teleport to="body">
      <div
        v-if="tooltip && !opened && showTooltip"
        ref="tooltipRef"
        class="multiselect-tooltip"
        :style="tooltipStyle"
      >
        {{ tooltip }}
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup generic="T extends IMultiselectOption">
import {
  ComponentPublicInstance,
  computed,
  nextTick,
  onMounted,
  ref,
  toRefs,
  useId,
} from 'vue'
import { Placement } from '@floating-ui/vue'
import { Cross, STInput } from '@samatech/st-input'
import {
  observePlacementChange,
  useDropdown,
  useKeyListener,
  useTooltipDelay,
  IMultiselectObj,
  IMultiselectOption,
} from '@samatech/component-utils'

const props = withDefaults(
  defineProps<{
    clearable?: boolean
    caret?: boolean
    searchable?: boolean
    disabled?: boolean
    options?: T[]
    // Overrides the active label. Useful to avoid including the selected entry in the list
    // TODO -- should we automatically filter out the selected value from options instead?
    forceLabel?: string
    // TODO -- implement multiple selection via array
    value: string | undefined
    labelKey?: string
    valueKey?: string
    placeholder?: string
    toggleId?: string
    tooltip?: string
    emptyText?: string
    // Adds a slot after options, instead of an option with `emptyText`
    customSlot?: boolean
    openInitial?: boolean
    // If true, the label is replaced with a slot
    customLabel?: boolean
    // Allow any search input to be selected, even if it's not in the list
    allowAny?: boolean
    openControl?: () => boolean
  }>(),
  {
    placeholder: undefined,
    openControl: undefined,
    toggleId: undefined,
    forceLabel: undefined,
    labelKey: 'label',
    valueKey: 'value',
    caret: true,
    options: () => [] as T[],
    tooltip: undefined,
    emptyText: 'No options available.',
  },
)
const {
  labelKey,
  openInitial,
  openControl,
  options,
  searchable,
  disabled,
  toggleId,
  value,
  valueKey,
  allowAny,
} = toRefs(props)

const emit = defineEmits<{
  (e: 'select', value: T | undefined): void
  (e: 'selectEmpty'): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

defineSlots<{
  default(props: { label: string; index: number }): void
  customSlot(): void
}>()

const dataToggleId = `toggle-${toggleId.value ?? useId()}`

const dropdownCurrentPlacement = ref<Placement>('bottom-end')

const dropdownTransformOrigin = computed(() => {
  if (dropdownCurrentPlacement.value === 'bottom-end') {
    return 'top'
  } else {
    return 'bottom'
  }
})

const {
  toggleRef,
  menuRef,
  opened,
  menuStyle,
  updateMenuPosition,
  setMenuOpened,
  toggleMenu,
} = useDropdown({
  clickawayIgnoreSelector: `div[data-toggle-id="${dataToggleId}"]`,
  offset: { mainAxis: 0, crossAxis: 0 },
  middlewares: [
    observePlacementChange({
      currentPlacement: dropdownCurrentPlacement,
      onChange: (newPlacement) => (dropdownCurrentPlacement.value = newPlacement),
    }),
  ],
  openControl: openControl.value,
  openChanged: (open: boolean) => {
    if (open) {
      emit('open')
    } else {
      closeMenu()
    }
  },
})

const search = ref('')
const searchActive = ref(false)
const searchRef = ref<InstanceType<typeof STInput> | undefined>()
const searchIndex = ref(0)

const multiselectRef = ref()

const {
  itemRef: tooltipAnchorRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  tooltipRef,
  tooltipStyle,
  show: showTooltip,
} = useTooltipDelay()

const setToggleRef = (element: Element | ComponentPublicInstance | null) => {
  toggleRef.value = element
  if (element) {
    tooltipAnchorRef.value = element as Element
  }
}

const closeMenu = () => {
  // TODO -- should this call setMenuOpened(false) ?
  search.value = ''
  searchActive.value = false
  if (opened.value) {
    emit('close')
  }
}
useKeyListener('Escape', closeMenu)

const getLabel = (item: T): string => {
  if (typeof item === 'string') {
    return item
  } else {
    return (item[labelKey.value as keyof IMultiselectObj] ?? '') as string
  }
}

type ISearchArr = [T, number][]

const filteredOptions = computed(() => {
  let filtered = options.value ?? []
  if (searchActive.value && search.value) {
    const searchStr = search.value.toLowerCase()
    // Filter entries that don't include search term
    filtered = filtered.filter((opt) => getLabel(opt).toLowerCase().includes(searchStr))
    // Assign search precedence
    let searchArr: ISearchArr = filtered.map((opt) => {
      const label = getLabel(opt).toLowerCase()
      let searchVal = 0
      if (opt === searchStr) {
        searchVal = 2
      } else if (label.startsWith(searchStr)) {
        searchVal = 1
      }
      return [opt, searchVal]
    })
    // Sort by search precedence
    searchArr = searchArr.sort((a, b) => b[1] - a[1])
    filtered = searchArr.map((s) => s[0])
  }
  if (opened.value) {
    updateMenuPosition()
  }
  return filtered
})

const labels = computed(() => {
  return filteredOptions.value.map(getLabel)
})

const label = computed(() => {
  const opts = options.value
  if (!opts || opts[0] === undefined || typeof opts[0] === 'string') {
    return value.value ?? ''
  }
  return (
    (opts as IMultiselectObj[]).find(
      (opt) => opt[valueKey.value as keyof IMultiselectObj] === value.value,
    )?.[labelKey.value as keyof IMultiselectObj] ?? ''
  )
})

const updateSearch = (value: string) => {
  search.value = value
  searchIndex.value = Math.min(searchIndex.value, filteredOptions.value.length)
}

const handleKeydown = (e: KeyboardEvent) => {
  const optionsLen = filteredOptions.value.length
  if (e.key === 'Tab') {
    e.stopPropagation()
    e.preventDefault()
    searchEnter()
  } else if (e.key === 'Escape') {
    e.stopPropagation()
    e.preventDefault()
    closeMenu()
    setMenuOpened(false)
  } else if (e.key === 'ArrowUp') {
    searchIndex.value = (searchIndex.value + optionsLen - 1) % optionsLen
  } else if (e.key === 'ArrowDown') {
    searchIndex.value = (searchIndex.value + optionsLen + 1) % optionsLen
  }
  emit('keydown', e)
}

const searchEnter = () => {
  if (filteredOptions.value[0]) {
    select(searchIndex.value)
    closeMenu()
    setMenuOpened(false)
  } else if (allowAny.value) {
    emit('select', search.value as T)
    search.value = ''
    setMenuOpened(false)
  }
}

const toggleDropdown = async () => {
  if (disabled.value) {
    return
  }
  toggleMenu()
  tooltipMouseLeave()
  if (searchable.value && opened.value) {
    searchActive.value = true
    searchIndex.value = 0
    await nextTick()
    searchRef.value?.inputRef?.focus()
  } else {
    searchActive.value = false
  }
}

const select = (index: number) => {
  emit('select', filteredOptions.value[index])
  search.value = ''
}

const clear = () => {
  setMenuOpened(false)
  emit('select', undefined)
}

onMounted(() => {
  if (openInitial.value) {
    toggleDropdown()
  }
})

defineExpose({ multiselectRef, toggleDropdown })
</script>

<style lang="postcss">
@import './multiselect.postcss';

$font-title: 'Mulish', Helvetica, sans-serif;
$font-text: 'Mulish', Helvetica, sans-serif;

.st-multiselect {
  width: 140px;
  position: relative;
  font-size: var(--ms-font-size);
  background: var(--ms-bg);
  cursor: pointer;
  border: var(--ms-border-width, 1px) solid var(--ms-border-color, #d1d5db);
  .st-ms-search {
    height: 100%;
    .st-input {
      border: none;
      padding: 0;
      height: 100%;
    }
  }
}
.ms-item.no-options {
  font-family: var(--st-component-text, $font-title);
  font-weight: 400;
  font-size: 12px;
  padding: 6px 8px;
}
.st-highlight {
  background-color: var(--ms-color-multiselect, #e6f3fe);
}
.st-ms-disabled {
  opacity: 0.6;
  cursor: initial;
  user-select: none;
}
.st-ms-label-text,
.st-ms-placeholder {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.st-ms-placeholder {
  color: var(--ms-placeholder-color);
}
.st-ms-clear {
  margin-left: auto;
}
.st-ms-clear-icon {
  display: flex;
  align-items: center;
  width: 13px;
  height: 13px;
}
.st-ms-caret {
  font-size: var(--ms-font-size, 1rem);
  cursor: pointer;
  width: 0.625rem;
  height: 1.125rem;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  background-color: var(--ms-caret-color, #999);
  margin: 0 4px 0 10px;
  mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z'/%3E%3C/svg%3E");
  pointer-events: none;
  position: relative;
  transform: rotate(0deg);
  transition: transform 0.25s;
  z-index: 10;
  &.opened {
    transform: rotate(180deg);
  }
}
.st-ms-dropdown {
  position: absolute;
  max-height: 300px;
  overflow-y: auto;
  z-index: 999;
  left: 0;
  width: 100%;
  top: 100%;
  transition: transform 0.2s ease-in-out;
  transform-origin: v-bind(dropdownTransformOrigin);
  border: var(--ms-border-width, 1px) solid var(--ms-border-color, #d1d5db);
  background-color: white;
}

.multiselect-tooltip {
  font-family: var(--st-component-title, $font-title);
  font-weight: 300;
  font-size: 12px;
  padding: 6px 8px;
  position: relative;
  color: var(--st-tooltip-text-color, #212629);
  user-select: none;
  background-color: white;
  border-radius: 2px;
  box-shadow: 1px 1px 24px 8px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-width: 220px;
}

.st-ms-slide-enter-from,
.st-ms-slide-leave-to {
  transform: scaleY(0);
}
</style>
