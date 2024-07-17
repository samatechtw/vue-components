import { IRgba } from '../types'
import { colorCodeToRgbaString, rgb2hsv, rgb2rgba } from './color'
import { hex2rgb } from './hex'

export function setColorValue(color: string | IRgba) {
  let rgba: IRgba = { r: 0, g: 0, b: 0, a: 1 }
  if (typeof color === 'string') {
    if (/#/.test(color)) {
      rgba = hex2rgb(color)
    } else if (/rgb/.test(color)) {
      rgba = rgb2rgba(color)
    } else if (/\d/.test(color)) {
      rgba = rgb2rgba(`rgba(${color})`)
    } else {
      const rgbaString = colorCodeToRgbaString(color)
      rgba = rgb2rgba(rgbaString)
    }
  } else if (Object.prototype.toString.call(color) === '[object Object]') {
    rgba = color
  }
  const { r, g, b, a } = rgba
  const { h, s, v } = rgb2hsv(rgba)
  return { r, g, b, a: a === undefined ? 1 : a, h, s, v }
}
