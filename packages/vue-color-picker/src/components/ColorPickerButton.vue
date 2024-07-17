<template>
  <button class="color-picker-button" @click="emit('click')">
    <slot />
  </button>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style lang="postcss" scoped>
.color-picker-button {
  color: var(--color-picker-color-light1, #f8f5f0);
  font-family: var(--color-picker-font-title);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  height: 26px;
  padding: 0 8px;
  border: none;
  cursor: pointer;
  background: #335;
  flex-shrink: 0;
  box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.4),
    inset -1px -1px 1px rgba(0, 0, 0, 0.4);
}
.color-picker-button:active {
  box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.8),
    inset -1px -1px 1px rgba(255, 255, 255, 0.4);
}
</style>
