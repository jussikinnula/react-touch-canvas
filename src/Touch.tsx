import * as React from 'react'
import { scale, transformedPoint, translate, getDistance } from './utils'

const WHEEL_MAX = 5
const TOUCH_SENSITIVITY = 5

type MouseEvent = React.MouseEvent<HTMLDivElement>
type TouchEvent = React.TouchEvent<HTMLDivElement>
type PanEvent = MouseEvent | TouchEvent

interface Props {
  scaleFactor?: number
  wheelMax?: number
  touchSensitivity?: number
  onPanStart?: Function
  onPan?: Function
  onPanEnd?: Function
  onPinchStart?: Function
  onPinch?: Function
  onPinchEnd?: Function
  onTranslate?: (x: number, y: number) => void
  onScale?: (x: number, y: number) => void
}

export class Touch extends React.Component<Props, {}> {
  node: HTMLDivElement = null

  lastX: number = null

  lastY: number = null

  panStart: DOMPoint = null

  panned: boolean = false

  touchCache: React.Touch[]

  lastDistance: number = 0

  zoomLevel: number = 0

  _setup = (node: HTMLDivElement) => {
    this.node = node
    this.node.style.display = 'block'
    this.node.style.margin = '0px'
    this.node.style.padding = '0px'
  }

  _updateCoordinatesMouse = (event: MouseEvent) => {
    this.lastX = event.pageX - this.node.offsetLeft
    this.lastY = event.pageY - this.node.offsetTop
  }

  _updateCoordinatesTouch = (event: TouchEvent) => {
    this.lastX = event.targetTouches[0].pageX - this.node.offsetLeft
    this.lastY = event.targetTouches[0].pageY - this.node.offsetTop
  }

  _onMouseDown = (event: MouseEvent) => {
    event.preventDefault()
    this._updateCoordinatesMouse(event)
    return this._onPanStart(event)
  }

  _onTouchStart = (event: TouchEvent) => {
    this._updateCoordinatesTouch(event)
    if (event.targetTouches.length > 1) return this._onPinchStart(event)
    return this._onPanStart(event)
  }

  _onPanStart = (event: any) => {
    const { onPanStart } = this.props
    this.panStart = transformedPoint(this.lastX, this.lastY)
    this.panned = false
    if (onPanStart) onPanStart(event)
  }

  _onMouseMove = (event: MouseEvent) => {
    event.preventDefault()
    this._updateCoordinatesMouse(event)
    return this._onPanMove(event)
  }

  _onTouchMove = (event: TouchEvent) => {
    this._updateCoordinatesTouch(event)
    if (event.targetTouches.length > 1) return this._onPinch(event)
    return this._onPanMove(event)
  }

  _onPanMove = (event: any) => {
    const { onPan, onTranslate } = this.props
    this.panned = true
    if (this.panStart) {
      const pt = transformedPoint(this.lastX, this.lastY)
      const x = pt.x - this.panStart.x
      const y = pt.y - this.panStart.y
      translate(x, y)
      if (onTranslate) onTranslate(x, y)
    }
    if (onPan) onPan(event)
  }

  _onMouseUp = (event: MouseEvent) => {
    event.preventDefault()
    return this._onPanEnd(event)
  }

  _onMouseLeave = (event: MouseEvent) => {
    event.preventDefault()
    return this._onPanEnd(event)
  }

  _onTouchEnd = (event: TouchEvent) => {
    event.preventDefault()
    if (event.targetTouches.length > 1) return this._onPinchEnd(event)
    return this._onPanEnd(event)
  }

  _onPanEnd = (event: any) => {
    const { onPanEnd } = this.props
    this.panStart = null
    if (!this.panned) this._zoom(event.shiftKey ? -1 : 1)
    if (onPanEnd) onPanEnd(event)
  }

  _zoom = (clicks: number) => {
    const { scaleFactor = 1.1, onScale, onTranslate } = this.props

    if ((this.zoomLevel + clicks) < 0) return

    this.zoomLevel += clicks

    const { x, y } = transformedPoint(this.lastX, this.lastY)

    translate(x, y)
    if (onTranslate) onTranslate(x, y)

    const factor = scaleFactor ** clicks
    scale(factor, factor)
    if (onScale) onScale(factor, factor)

    translate(-x, -y)
    if (onTranslate) onTranslate(-x, -y)
  }

  _onPinchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const { onPinchStart } = this.props
    this.touchCache = []
    for (let i = 0; i < event.targetTouches.length; i += 1) {
      const touch = event.targetTouches[i]
      this.touchCache.push(touch)
    }
    this.lastDistance = 0
    if (onPinchStart) onPinchStart(event)
  }

  _onPinch = (event: React.TouchEvent<HTMLDivElement>) => {
    const { onPinch, touchSensitivity = TOUCH_SENSITIVITY } = this.props

    const touch1 = event.targetTouches[0]
    const touch2 = event.targetTouches[1]
    const startTouch1 = this.touchCache.find(touch => touch.identifier === touch1.identifier)
    const startTouch2 = this.touchCache.find(touch => touch.identifier === touch2.identifier)
    this.lastX = ((touch1.clientX + touch2.clientX) / 2) - this.node.offsetLeft
    this.lastY = ((touch1.clientY + touch2.clientY) / 2) - this.node.offsetTop

    if (startTouch1 && startTouch2) {
      const distance = getDistance(touch1, touch2)
      if (this.lastDistance) {
        const initialDistance = getDistance(startTouch1, startTouch2)
        const ratio = (distance - this.lastDistance) / initialDistance
        this._zoom(ratio * touchSensitivity)
      }

      this.lastDistance = distance
    }

    if (onPinch) onPinch(event)
  }

  _onPinchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const { onPinchEnd } = this.props
    if (onPinchEnd) onPinchEnd(event)
  }

  _onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const { wheelMax = WHEEL_MAX } = this.props
    event.preventDefault()

    let delta = Math.round(event.deltaY / 10)
    if (delta < 0 || delta > 0) {
      if (delta > wheelMax) delta = wheelMax
      else if (delta < -wheelMax) delta = -wheelMax
      this._zoom(delta)
    }
  }

  render() {
    const {
      onPanStart,
      onPan,
      onPanEnd,
      onTranslate,
      onScale,
      ...props
    } = this.props

    return (
      <div
        onMouseDown={this._onMouseDown}
        onMouseMove={this._onMouseMove}
        onMouseUp={this._onMouseUp}
        onMouseLeave={this._onMouseLeave}
        onWheel={this._onWheel}
        onTouchStart={this._onTouchStart}
        onTouchMove={this._onTouchMove}
        onTouchEnd={this._onTouchEnd}
        ref={this._setup}
        {...props}
      />
    )
  }
}
