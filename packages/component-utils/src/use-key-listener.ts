import { onMounted, onUnmounted } from 'vue'

export type KeyCallback = (event: KeyboardEvent, keys: string[]) => void

export const useKeyListener = (
  keys: string | string[],
  keyCallback: KeyCallback,
  eventType = 'keyup',
) => {
  const keyArray = Array.isArray(keys) ? keys : [keys]
  const keyStringArray = keyArray.map((k) => k.toString())

  const keyListener = (event: KeyboardEvent) => {
    if (keyStringArray.includes(event.key)) {
      keyCallback(event, keyArray)
    }
  }

  onMounted(() => {
    window.addEventListener(eventType, keyListener as EventListener)
  })

  onUnmounted(() => {
    window.removeEventListener(eventType, keyListener as EventListener)
  })
}
