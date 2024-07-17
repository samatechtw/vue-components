export function createAlphaSquare(size: number) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Fail to get 2d context from canvas')
  }
  const doubleSize = size * 2
  canvas.width = doubleSize
  canvas.height = doubleSize

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, doubleSize, doubleSize)
  ctx.fillStyle = '#ccd5db'
  ctx.fillRect(0, 0, size, size)
  ctx.fillRect(size, size, size, size)

  return canvas
}
