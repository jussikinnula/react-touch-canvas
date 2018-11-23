import * as React from 'react'

export interface Props {
  image: HTMLImageElement
}

export class ImageCanvas extends React.Component<Props> {
  canvas: HTMLCanvasElement = null

  componentDidMount() {
    this.redraw()
  }

  componentDidUpdate() {
    this.redraw()
  }

  redraw() {
    const { image } = this.props
    if (!this.canvas || !image) return
    const { width, height } = image
    this.canvas.width = width
    this.canvas.height = height
    const ctx = this.canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
  }

  setup = (node: HTMLCanvasElement) => {
    this.canvas = node
    this.redraw()
  }

  render() {
    return <canvas ref={this.setup} />
  }
}
