import * as React from 'react'
import { Touch, Canvas } from '../../../src'
import './index.styl'

interface State {
  width: number
  height: number
}

export default class App extends React.Component<{}, State> {
  container: HTMLDivElement = null

  ctx: CanvasRenderingContext2D = null

  image: HTMLImageElement = new Image()

  state: State = {
    width: 800,
    height: 600
  }

  componentWillMount() {
    this.image.src = 'https://via.placeholder.com/350x150'
  }

  componentDidMount() {
    setTimeout(() => this.updateDimensions(), 100)
    window.addEventListener('resize', () => this.updateDimensions())
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateDimensions())    
  }

  onAnimationFrame = (ctx: CanvasRenderingContext2D, _time: number) => {
    const { width, height } = this.image
    ctx.drawImage(this.image, 0, 0, width, height)
  }

  updateContainer = (node: HTMLDivElement) => {
    this.container = node
  }

  updateDimensions = () => {
    if (!this.container) return
    const { width, height } = this.container.getBoundingClientRect()
    this.setState({ width, height })
  }

  render() {
    const { width, height } = this.state

    return (
      <div className="App" ref={this.updateContainer}>
        <Touch
          onScale={(x: number, y: number) => this.ctx.scale(x, y)}
          onTranslate={(x: number, y: number) => this.ctx.translate(x, y)}
        >
          <Canvas
            width={width}
            height={height}
            onAnimationFrame={this.onAnimationFrame}
            getContext={(ctx: CanvasRenderingContext2D) => this.ctx = ctx}
          />
        </Touch>
      </div>
    );
  }
}
