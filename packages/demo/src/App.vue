<template>
  <div class="vue-components-demo">
    <h1 class="title">Vue Components Demo</h1>
    <div class="text">@samatech/vue-components</div>
    <div class="content-wrap">
      <STMultiselect
        v-if="!deleteSelect"
        :value="selected"
        :options="options"
        placeholder="Options"
        class="multiselect"
        @select="select"
      />
      <STInput
        v-model="text"
        class="my-input"
        name="my-input"
        placeholder="My Input"
        :clearable="true"
      />
      <div class="values">
        <div class="multiselect-value">
          {{ selected ?? 'No selection' }}
        </div>
        <div class="input-value">
          {{ text }}
        </div>
      </div>
    </div>
    <div class="footer">
      © SamaTech 2024. All rights reserved. Hosted on
      <a target="_blank" href="https://pubstud.io">PubStudio</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { STMultiselect, STInput } from '@samatech/vue-components'
import '@samatech/vue-components/dist/style.css'

import '@samatech/vue-components/dist/style.css'

const selected = ref()
const text = ref('')
const deleteSelect = ref(false)

const options = ['Option1', 'Option2', 'Option3', 'Delete']

const select = (option: string | undefined) => {
  if (option === 'Delete') {
    deleteSelect.value = true
  }
}
</script>

<style lang="postcss">
@import '/node_modules/@samatech/vue-components/dist/style.css';

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
  margin-top: 80px;
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

.vue-components-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  text-align: center;
}

.content-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 900px;
  margin: 64px auto 0;
  min-height: 100vh;
}
.values {
  margin-top: 24px;
}
.my-input {
  margin-top: 16px;
}

.footer {
  font-size: 12px;
  padding: 12px 0 8px;
  margin: auto auto 0;
  color: white;
}
</style>
