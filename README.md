<h2 align='center'>@samatech/vue-components</h2>

<p align='center'>Vue components library</p>

<p align='center'>
<a href='https://www.npmjs.com/package/@samatech/vue-components'>
  <img src='https://img.shields.io/npm/v/@samatech/vue-components?color=222&style=flat-square'>
</a>
</p>

<br>

## Instructions

### Install

```bash
npm i -S @samatech/vue-components
```

### Usage

Displays the components. See `packages/demo` for a full advanced example.

```Vue
<template>
  <STMultiselect
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
  <STProgressBar
    :value="progress"
    :step="1"
    :showPercent="false"
    :height="4"
    :min="1"
    :max="100"
    @change="progress = $event"
  >
</template>

<script setup lang="ts">
import { STMultiselect, STInput, STProgressBar } from '@samatech/vue-components'
import '@samatech/vue-components/dist/style.css'

const selected = ref()
const options = ['Option1', 'Option2', 'Option3']
const text = ref()
const progress = ref(3)

const select = (option: string | undefined) => {
  selected.value = option
}
</script>
```

## Development

We use [PNPM](https://pnpm.io/) workspaces for development

```bash
# Clone
git clone git@github.com:samatechtw/vue-components
cd vue-components

# Install dependencies
pnpm install

# Build library
pnpm run build

# Run example site
pnpm run demo
```

## License

MIT License © 2021 - 2025 [SamaTech Limited Company](https://github.com/samatechtw)
