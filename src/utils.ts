import * as React from 'react'
import { EventEmitter } from 'events'
import { TRANSLATE, SCALE, RESET } from './constants'

const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
let matrix: any = svg.createSVGMatrix()

export const onChange = new EventEmitter()

export function translate(x: number, y: number) {
  matrix = matrix.translate(x, y)
  return onChange.emit(TRANSLATE, x, y)
}

export function scale(x: number, y: number) {
  matrix = matrix.scaleNonUniform(x, y)
  return onChange.emit(SCALE, x, y)
}

export function transformedPoint(x: number, y: number) {
  const pt = svg.createSVGPoint()
  pt.x = x
  pt.y = y
  return pt.matrixTransform(matrix.inverse())
}

export function reset() {
  matrix = svg.createSVGMatrix()
  return onChange.emit(RESET)
}

export function getDistance(touch1: React.Touch, touch2: React.Touch) {
  const a = touch1.clientX - touch2.clientX
  const b = touch1.clientY - touch2.clientY
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
}
