import * as React from 'react'
import { EventEmitter } from 'events'
import {
  getDistance,
  onChange,
  reset,
  rotate,
  scale,
  transformedPoint,
  translate
} from './utils'
import {
  TRANSLATE,
  SCALE,
  MIN_ZOOM_LEVEL,
  SCALE_FACTOR,
  TOUCH_SENSITIVITY,
  WHEEL_MAX,
  WHEEL_SENSITIVITY_ROTATE,
  WHEEL_SENSITIVITY_ZOOM
} from './constants'

type MouseEvent = React.MouseEvent<HTMLDivElement>
type TouchEvent = React.TouchEvent<HTMLDivElement>
type MouseOrTouchEvent = MouseEvent | TouchEvent

interface Props {
  options?: {
    minZoomLevel?: number
    scaleFactor?: number
    touchSensitivity?: number
    wheelMax?: number
    wheelSensitivityRotate?: number
    wheelSensitivityZoom?: number
  },
  onPanStart?: (event: MouseOrTouchEvent) => void
  onPan?: (event: MouseOrTouchEvent) => void
  onPanEnd?: (event: MouseOrTouchEvent) => void
  onPinchStart?: (event: TouchEvent) => void
  onPinch?: (event: TouchEvent) => void
  onPinchEnd?: (event: TouchEvent) => void
  onTranslate?: (x: number, y: number) => void
  onScale?: (factor: number) => void
  onRotate?: (degrees: number) => void
  onReset?: () => void
  onZoom?: (factor: number, x: number, y: number) => void
  onCoordinates?: (x: number, y: number) => void
}

export class Touch extends React.Component<Props> {
  node: HTMLDivElement = null
  matrix: DOMMatrix
  x: number = null
  y: number = null
  rotateStart: DOMPoint = null
  rotated: boolean = false
  panStart: DOMPoint = null
  panned: boolean = false
  touchCache: React.Touch[]
  lastDistance: number = 0
  zoomLevel: number = 0
  matrixEvents: EventEmitter = null

  componentDidMount() {
    reset()
    window.addEventListener('resize', this._reset)
    onChange.addListener(TRANSLATE, this._onTranslate)
    onChange.addListener(SCALE, this._onScale)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._reset)
    onChange.removeListener(TRANSLATE, this._onTranslate)
    onChange.removeListener(SCALE, this._onScale)
  }

  _onTranslate = (x: number, y: number) => {
    const { onTranslate } = this.props
    if (onTranslate) onTranslate(x, y)
  }

  _onScale = (factor: number) => {
    const { onScale } = this.props
    if (onScale) onScale(factor)
  }

  _setup = (node: HTMLDivElement) => {
    if (!node) return
    this.node = node
    this.node.style.display = 'block'
    this.node.style.margin = '0px'
    this.node.style.padding = '0px'
  }

  _reset = () => {
    const { onReset } = this.props
    reset()
    this.zoomLevel = 0
    if (onReset) onReset()
  }

  _updateCoordinates = (x: number, y: number) => {
    const { onCoordinates } = this.props
    this.x = x
    this.y = y
    if (onCoordinates) onCoordinates(x, y)
  }

  _updateCoordinatesMouse = (event: MouseEvent) => {
    const x = event.pageX - this.node.offsetLeft
    const y = event.pageY - this.node.offsetTop
    this._updateCoordinates(x, y)
  }

  _updateCoordinatesTouch = (event: TouchEvent) => {
    const x = event.targetTouches[0].pageX - this.node.offsetLeft
    const y = event.targetTouches[0].pageY - this.node.offsetTop
    this._updateCoordinates(x, y)
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
    this.panStart = transformedPoint(this.x, this.y)
    this.panned = false
    if (onPanStart) onPanStart(event)
  }

  _onMouseMove = (event: MouseEvent) => {
    event.preventDefault()
    this._updateCoordinatesMouse(event)
    if (this.panStart) return this._onPanMove(event)
  }

  _onTouchMove = (event: TouchEvent) => {
    event.preventDefault()
    this._updateCoordinatesTouch(event)
    if (event.targetTouches.length > 1) return this._onPinch(event)
    return this._onPanMove(event)
  }

  _onPanMove = (event: any) => {
    const { onPan } = this.props
    this.panned = true
    const pt = transformedPoint(this.x, this.y)
    const x = pt.x - this.panStart.x
    const y = pt.y - this.panStart.y
    translate(x, y)
    if (onPan) onPan(event)
  }

  _onMouseUp = (event: MouseEvent) => {
    event.preventDefault()
    if (this.rotateStart) this.rotateStart = null
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
    if (!this.panned && !this.rotated) this._onZoom(event.shiftKey ? -1 : 1)
    if (onPanEnd) onPanEnd(event)
  }

  _onZoom = (clicks: number) => {
    const { options = {}, onZoom } = this.props
    const {
      scaleFactor = SCALE_FACTOR,
      minZoomLevel = MIN_ZOOM_LEVEL
    } = options

    let actualClicks = 0
    if ((this.zoomLevel + clicks) < minZoomLevel) {
      actualClicks = minZoomLevel - this.zoomLevel
    } else {
      actualClicks = clicks
    }

    this.zoomLevel += actualClicks

    const { x, y } = transformedPoint(this.x, this.y)
    const factor = scaleFactor ** actualClicks

    translate(x, y, false)
    scale(factor)
    translate(-x, -y, false)
    if (onZoom) onZoom(factor, x, y)
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
    const { onPinch, options = {} } = this.props
    const { touchSensitivity = TOUCH_SENSITIVITY } = options

    const touch1 = event.targetTouches[0]
    const touch2 = event.targetTouches[1]
    const startTouch1 = this.touchCache.find(touch => touch.identifier === touch1.identifier)
    const startTouch2 = this.touchCache.find(touch => touch.identifier === touch2.identifier)
    const x = ((touch1.clientX + touch2.clientX) / 2) - this.node.offsetLeft
    const y = ((touch1.clientY + touch2.clientY) / 2) - this.node.offsetTop
    this._updateCoordinates(x, y)

    if (startTouch1 && startTouch2) {
      const distance = getDistance(touch1, touch2)
      if (this.lastDistance) {
        const initialDistance = getDistance(startTouch1, startTouch2)
        const ratio = (distance - this.lastDistance) / initialDistance
        this._onZoom(ratio * touchSensitivity)
      }

      this.lastDistance = distance
    }

    if (onPinch) onPinch(event)
  }

  _onPinchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const { onPinchEnd } = this.props
    if (onPinchEnd) onPinchEnd(event)
  }

  _onRotate = (delta: number) => {
    const { height } = this.node.getBoundingClientRect()
    const degrees = delta / height
    const { onRotate } = this.props
    rotate(degrees)
    if (onRotate) onRotate(degrees)
  }

  _onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    const { options = {} } = this.props
    const {
      wheelMax = WHEEL_MAX,
      wheelSensitivityRotate = WHEEL_SENSITIVITY_ROTATE,
      wheelSensitivityZoom = WHEEL_SENSITIVITY_ZOOM
    } = options

    let delta = event.deltaY / 10
    delta = delta > wheelMax ? wheelMax : delta < -wheelMax ? -wheelMax : delta
    if (delta < 0 || delta > 0) {
      if (event.ctrlKey) return this._onRotate(delta / wheelSensitivityRotate)
      return this._onZoom(delta / wheelSensitivityZoom)
    }
  }

  render() {
    const {
      onPanStart,
      onPan,
      onPanEnd,
      onPinchStart,
      onPinch,
      onPinchEnd,
      onTranslate,
      onScale,
      onRotate,
      onReset,
      onZoom,
      onCoordinates,
      options,
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
