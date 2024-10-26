<template>
  <div class="st-input-wrap">
    <span v-if="prefix" class="st-input-prefix">
      {{ prefix }}
    </span>
    <input
      ref="inputRef"
      :class="[
        'st-input',
        inputClass,
        prefix && 'has-prefix',
        suffix && 'has-suffix',
        clearable && 'has-icon-button',
        isEmpty && 'empty',
        isError && 'error',
      ]"
      :autocomplete="autocomplete"
      :value="modelValue"
      :type="type"
      :disabled="isDisabled"
      :placeholder="placeholder"
      :name="inputName"
      :required="required"
      :list="normalizedDatalistId"
      @input="handleInput"
      @focusout="emit('focusout', modelValue)"
      @keyup="emit('keyup', $event)"
      @keydown="emit('keydown', $event)"
      @keyup.enter="emit('handle-enter')"
    />
    <datalist v-if="datalist" :id="normalizedDatalistId">
      <option v-for="option in datalist" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </datalist>
    <label
      v-if="label"
      class="st-input-label"
      :for="inputName"
      :class="{ active: showTitleTop }"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="st-input-required">
        {{ requiredStar }}
      </span>
    </label>
    <span v-else-if="suffix" class="st-input-suffix"> {{ suffix }}</span>
    <IconButtonWrap
      v-if="clearable"
      class="clear-button-wrap"
      :disabled="isDisabled"
      @click="clear"
    >
      <Cross />
    </IconButtonWrap>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, useId } from 'vue'
import { IDatalistOption } from './i-datalist-option'
import IconButtonWrap from './IconButtonWrap.vue'
import Cross from './Cross.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: number | string
    placeholder?: string
    label?: string | null
    type?: string
    name?: string
    autocomplete?: string
    isError?: boolean
    isDisabled?: boolean
    inputClass?: string | null
    maxLength?: number
    prefix?: string | null
    suffix?: string | null
    required?: boolean
    clearable?: boolean
    datalistId?: string
    datalist?: IDatalistOption[]
  }>(),
  {
    modelValue: '',
    placeholder: '',
    label: null,
    type: 'text',
    name: undefined,
    autocomplete: 'off',
    isDisabled: false,
    inputClass: null,
    maxLength: undefined,
    prefix: null,
    suffix: null,
    required: false,
    datalistId: undefined,
    datalist: undefined,
  },
)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focusout', value: string | number | undefined): void
  (e: 'keyup', event: KeyboardEvent): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'handle-enter'): void
  (e: 'clear'): void
}>()

const { type, name, placeholder, maxLength, modelValue, required, datalistId } =
  toRefs(props)

const inputRef = ref<HTMLInputElement>()

defineExpose({ inputRef })

const requiredStar = ` *`

const uid = useId()

const inputName = computed(() => {
  return name.value || `input${uid}`
})

const isEmpty = computed(() => {
  return String(modelValue.value) === ''
})

const normalizedDatalistId = computed(() => {
  if (datalistId.value) {
    // For some reason datalist id with '-' is not working in Vue 3
    return datalistId.value.replace(/-/g, '')
  }
  return undefined
})

const showTitleTop = computed(() => {
  return placeholder.value || modelValue.value || modelValue.value === 0
})

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement)?.value
  if (maxLength.value !== undefined) {
    const limitedValue = value.slice(0, maxLength.value)
    emit('update:modelValue', limitedValue)
    if (inputRef.value) {
      inputRef.value.value = limitedValue
    }
  } else {
    emit('update:modelValue', value)
  }
}

const clear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style lang="postcss" scoped>
@import '../../component-utils/src/defines.postcss';

.st-input-wrap {
  position: relative;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}

.st-input-label {
  @mixin title-thin 14px;
  position: absolute;
  top: 10px;
  padding: 0 4px;
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.6);
  transition: ease 0.2s all;
  pointer-events: none;
}

.st-input-label.active,
.st-input:focus ~ .st-input-label {
  @mixin title-thin 11px;
  top: -9px;
  background-color: white;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  color: rgba(0, 0, 0, 0.9);
  padding-top: 2px;
}
.st-input-required {
  color: $color-error;
}
.st-input {
  @mixin text-medium 13px;
  background-color: rgba(255, 255, 255, 0.3);
  box-sizing: border-box;
  color: $color-title;
  width: 100%;
  height: 40px;
  border-radius: 2px;
  border: 1px solid $color-light1;
  outline: none;
  outline-style: none;
  box-shadow: none;
  padding: 8px 10px;
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &::placeholder {
    color: $color-title;
    opacity: 0.5;
  }

  &.has-prefix {
    padding-left: 64px;
  }

  &.has-suffix {
    padding-right: 32px;
  }

  &.has-icon-button {
    padding-right: 24px;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    background-color: white;
    border-width: 1.5px;
    &::-webkit-input-placeholder {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &.error {
    border: 1px solid $color-error-border;
    color: $color-error-light;
    background-color: $color-error-bg;
    &:not(:disabled)::placeholder {
      color: $color-error-light;
    }
  }

  &:disabled {
    border: 1px solid $grey-300;
    color: $color-disabled;
    -webkit-text-fill-color: $color-disabled;
    background-color: $grey-100;
  }

  /* stylelint-disable */
  &:-internal-autofill-selected,
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    /* Disable background color of input autocomplete */
    box-shadow: 0 0 0 100px #fff inset !important;
    font-size: initial !important;
  }
  /* stylelint-enable */

  &[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
  &[type='number']::-webkit-inner-spin-button,
  &[type='number']::-webkit-outer-spin-button {
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
  }
}

textarea.st-input {
  height: auto;
  padding: 8px;
}

.st-input-prefix {
  @mixin text-medium 16px;
  color: $color-text;
  position: absolute;
  top: 16px;
  left: 14px;
}

.st-input-suffix {
  @mixin text-medium 14px;
  color: $color-text;
  position: absolute;
  top: 10px;
  right: 12px;
}

:deep(.icon-button-wrap) {
  width: 20px;
  height: 20px;
  position: absolute;
  top: 9px;
  right: 4px;
}

.bo {
  border: 1px solid red;
}

@media (max-width: 680px) {
  .st-input-wrap {
    border-radius: 16px;
  }
}
</style>
