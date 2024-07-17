import { IPickerColor, IRgba } from '../types'

export function rgb2rgba(rgba: string): IRgba {
  const rgbaArr = (/rgba?\((.*?)\)/.exec(rgba) || ['', '0,0,0,1'])[1].split(',')
  return {
    r: Number(rgbaArr[0]) || 0,
    g: Number(rgbaArr[1]) || 0,
    b: Number(rgbaArr[2]) || 0,
    a: Number(rgbaArr[3] ? rgbaArr[3] : 1), // Avoid the case of 0
  }
}

export function rgb2hsv({ r, g, b }: IRgba) {
  r = r / 255
  g = g / 255
  b = b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (max === min) {
    h = 0
  } else if (max === r) {
    if (g >= b) {
      h = (60 * (g - b)) / delta
    } else {
      h = (60 * (g - b)) / delta + 360
    }
  } else if (max === g) {
    h = (60 * (b - r)) / delta + 120
  } else if (max === b) {
    h = (60 * (r - g)) / delta + 240
  }
  h = Math.floor(h)
  const s = parseFloat((max === 0 ? 0 : 1 - min / max).toFixed(2))
  const v = parseFloat(max.toFixed(2))
  return { h, s, v }
}

// Convert "red", "blue", "#ff0000", "rgb(255, 0, 0)", or "rgba(255, 0, 0, 0.5)" to rgba value.
export const colorCodeToRgbaString = (color: string): string => {
  const span = document.createElement('span')
  span.style.color = color

  document.body.appendChild(span)
  const rgba = getComputedStyle(span).color

  document.body.removeChild(span)
  return rgba
}

// Convert IPickerColor to a CSS string value or theme variable that can be rendered
export const colorToCssValue = (
  pickerColor: IPickerColor | undefined,
  useCssVar: boolean,
): string | undefined => {
  if (pickerColor === undefined) {
    return undefined
  }
  if (pickerColor.themeVar) {
    if (useCssVar) {
      return `var(--${pickerColor.themeVar})`
    } else {
      return `$\{${pickerColor.themeVar}}`
    }
  } else {
    const c = pickerColor.rgba
    return c ? `rgba(${c.r},${c.g},${c.b},${c.a})` : undefined
  }
}
