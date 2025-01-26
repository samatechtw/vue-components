import Vue from '@vitejs/plugin-vue'
import path from 'path'
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { defineConfig } from 'vite'

const resolve = (p: string): string => path.resolve(__dirname, p)

const outputName = 'vue-components-export.es.js'

const externalVue = (bundleName) => {
  return {
    name: 'rollup-plugin-external-vue',
    generateBundle(_options, bundle, _isWrite) {
      for (const file of Object.keys(bundle)) {
        if (file === bundleName) {
          const code = bundle[file].code
          bundle[file].code = code.replace(
            /import\s+?\{(.*?)\}\s+?from "vue"/,
            (_match, capture) => {
              return `const {${capture.replaceAll(' as', ':')}} = window.Vue`
            },
          )
        }
      }
    },
  }
}

export default defineConfig({
  assetsInclude: /\.(pdf|jpg|png|webm|mp4|svg|wasm)$/,
  plugins: [
    Vue(),
    libAssetsPlugin({
      limit: 1024 * 200,
      include: /\.(pdf|jpg|jpeg|png|webm|mp4|svg|ttf|woff|woff2|wasm)$/,
    }),
    cssInjectedByJsPlugin(),
    externalVue(outputName),
  ],
  worker: {
    format: 'es',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    lib: {
      formats: ['es'],
      entry: [resolve('./src/index.ts')],
      name: 'vue-components-export',
      fileName: () => outputName,
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled
      external: ['vue'],
      output: {
        format: 'es',
        dir: 'dist',
      },
    },
  },
})
