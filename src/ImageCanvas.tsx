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
    let size: number = 0;
    let x: number = 0;
    let y: number = 0;
    if (width > height) {
      size = width;
      y = (width - height) / 2
    } else {
      size = height;
      x = (height - width) / 2
    }

    this.canvas.width = size
    this.canvas.height = size
    const ctx = this.canvas.getContext('2d')
    ctx.drawImage(image, x, y, width, height)
  }

  setup = (node: HTMLCanvasElement) => {
    this.canvas = node
    this.redraw()
  }

  render() {
    return <canvas ref={this.setup} />
  }
}
