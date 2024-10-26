# Component Export Bundle

This package is used to generate compiled components that can be copy pasted directly int a page script.

All dependencies are bundled except Vue, which should be available globally.

To ensure Vue is available, you may need to do:

```js
window.Vue = Vue
```

This disables tree-shaking for Vue. If you wish to only use the necessary Vue exports, you can do this instead:

```js
window.Vue = {}
```
