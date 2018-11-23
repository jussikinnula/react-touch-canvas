import * as React from 'react'
import { EventEmitter } from 'events'
import { RESET, ROTATE, SCALE, TRANSLATE } from './constants'

const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
let matrix: DOMMatrix = svg.createSVGMatrix()

export const onChange = new EventEmitter()

export function translate(x: number, y: number, emitChanges: boolean = true) {
  matrix = matrix.translate(x, y)
  if (emitChanges) onChange.emit(TRANSLATE, x, y)
}

export function scale(factor: number, emitChanges: boolean = true) {
  matrix = matrix.scale(factor)
  if (emitChanges) onChange.emit(SCALE, factor)
}

export function rotate(radians: number, emitChanges: boolean = true) {
  const degrees = radians * 180 / Math.PI
  matrix = matrix.rotate(degrees, degrees)
  if (emitChanges) onChange.emit(ROTATE, degrees)
}

export function transformedPoint(x: number, y: number) {
  const pt = svg.createSVGPoint()
  pt.x = x
  pt.y = y
  return pt.matrixTransform(matrix.inverse())
}

export function getMatrix() {
  return matrix
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
