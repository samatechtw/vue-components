<template>
  <div class="vue-components-demo">
    <h1 class="title">Vue Components Demo</h1>
    <div class="text">@samatech/vue-components</div>
    <div class="content-wrap">
      <div class="label">Multiselect basic array options</div>
      <STMultiselect
        v-if="!deleteSelect1"
        :value="selected1"
        :options="options1"
        placeholder="Options"
        class="multiselect"
        @select="select1"
      />
      <div class="label">Multiselect search with complex options</div>
      <STMultiselect
        :value="selectedComplex?.name"
        placeholder="Complex Options"
        :options="complexOptions"
        labelKey="name"
        valueKey="name"
        :searchable="true"
        :clearable="false"
        class="multiselect"
        @select="select2"
        @click.stop
      />
      <div class="label">Clearable input</div>
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
      <STProgressBar
        id="p1"
        :value="progress"
        :step="1"
        :showPercent="false"
        :height="4"
        :min="1"
        :max="7"
        class="progress"
        @change="progress = $event"
      />
    </div>
    <div class="footer">
      © SamaTech 2024. All rights reserved. Hosted on
      <a target="_blank" href="https://pubstud.io">PubStudio</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { STMultiselect, STInput, STProgressBar } from '@samatech/vue-components'
import '@samatech/vue-components/dist/style.css'
// import { STMultiselect, STInput } from '@samatech/vue-components'
// import STProgressBar from '@local/STProgressBar.vue'

const progress = ref(3)

const selected = ref()

const selected1 = ref()
const text = ref('')
const deleteSelect1 = ref(false)

const options1 = ['Option1', 'Option2', 'Option3', 'Delete']

const select1 = (option: string | undefined) => {
  if (option === 'Delete') {
    deleteSelect1.value = true
  } else {
    selected1.value = option
  }
  selected.value = option
}

const selectedComplex = ref()

const select2 = (option: any | undefined) => {
  selected.value = option.name
  selectedComplex.value = option
}

const complexOptions = [
  { id: 'global-b-none', name: 'None', code: 'none' },
  {
    id: 'global-b-viewcounter',
    name: 'View Counter',
    code: 'viewcounter',
  },
  { name: 'ClickDebug' },
  {
    id: 'global-b-selectLanguage',
    name: 'SelectLanguage',
    args: { language: { default: 'en' } },
    code: 'selectlang',
  },
  {
    id: 'global-b-setupLanguage',
    name: 'SetupLanguage',
    args: {
      default: { name: 'default', type: 'string' },
    },
    code: 'setup',
  },
  {
    id: 'global-b-toggleHidden',
    name: 'Toggle Hidden',
    code: 'toggle',
  },
  {
    id: 'global-b-setHidden',
    name: 'Set Hidden',
    code: 'sethidden',
  },
  {
    id: 'global-b-viewcounter',
    name: 'View Counter',
    code: 'viewcounter',
  },
  {
    id: 'global-b-homeLink',
    name: 'Home Link',
    code: 'homelink',
  },
  {
    id: 'global-b-contactformclearerror',
    name: 'Clear Error',
    args: {
      errorId: { name: 'errorId', type: 'string', help: 'The ID of the error component' },
    },
    code: 'clear',
  },
  {
    id: 'global-b-contactform',
    name: 'Contact Form Submit',
    code: 'contactform',
  },
  {
    id: 'global-b-mailinglist',
    name: 'Mailing List Submit',
    args: {
      tableName: {
        name: 'tableName',
        type: 'string',
      },
    },
    code: 'apiCode',
  },
]
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

@define-mixin title $size {
  font-family: Helvetica, sans-serif;
  font-weight: 600;
  font-size: $size;
}

h1 {
  @mixin title 32px;
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
  max-width: 240px;
  width: 100%;
  margin: 64px auto 0;
  min-height: 100vh;
}
.label {
  @mixin title 13px;
}
.multiselect {
  width: 100%;
  margin: 4px 0 12px;
}
.values {
  margin-top: 24px;
}
.my-input {
  margin-top: 4px;
  width: 100%;
}
.progress {
  margin-top: 58px;
}

.footer {
  font-size: 12px;
  padding: 12px 0 8px;
  margin: auto auto 0;
  color: white;
}
</style>
