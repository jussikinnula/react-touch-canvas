import * as React from 'react'
import { Touch, ImageCanvas } from '../../../src'
import { getMatrix } from '../../../src/utils'
import { Surface } from 'gl-react-dom'
import { Node, Shaders, GLSL, Vec2 } from 'gl-react'
import './index.styl'

const shaders = Shaders.create({
  image: {
    frag: GLSL`
precision highp float;

varying vec2 v_position;

uniform sampler2D u_sampler;
uniform vec2 u_image;
uniform vec2 u_pointer;
uniform vec2 u_resolution;
uniform vec2 u_scale;
uniform vec2 u_translation;

void main() {
  // Initial scale
  vec2 ratio = vec2(u_image.x / u_resolution.x, u_image.y / u_resolution.y);
  float multiplier = max(ratio.x, ratio.y);
  vec2 initialScale = vec2(multiplier, multiplier);

  // Use position
  vec2 imagePosition = v_position;

  // Scale
  imagePosition = imagePosition / u_scale;

  // Center offset (in real pixels)
  vec2 centerOffset = (u_resolution - u_image / initialScale) * vec2(0.5, 0.5);

  // Scale offset (in relative 0...1)
  vec2 scaleOffset = vec2(1.0, 1.0) / u_scale * vec2(0.5, 0.5);
  imagePosition = imagePosition + u_scale * scaleOffset - scaleOffset;

  // Translate
  imagePosition = imagePosition - (u_translation + centerOffset) / u_resolution;

  // Convert aspect ratio to real pixels
  imagePosition = imagePosition * u_resolution / u_image;

  // Maximize image size
  imagePosition = imagePosition * initialScale;

  if (imagePosition.x < 0.0 || imagePosition.x > 1.0 || imagePosition.y < 0.0 || imagePosition.y > 1.0) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
    return;
  }

  gl_FragColor = texture2D(u_sampler, imagePosition);
  return;
}`,
    vert: GLSL`
attribute vec2 _p;
varying vec2 v_position;

void main() {
  gl_Position = vec4(_p, 0.0, 1.0);
  v_position = vec2(0.5, 0.5) * (_p + vec2(1.0, 1.0));
}`
  }
})

interface Props {}

interface State {
  resolution: Vec2
  image: Vec2
  translation: Vec2
  scale: Vec2
  pointer: Vec2
}

export class WebGLCanvasPage extends React.Component<Props, State> {
  container: HTMLDivElement = null
  touch: Touch = null
  image: HTMLImageElement = null
  x: number = 0
  y: number = 0

  state: State = {
    resolution: [800, 600],
    image: [0, 0],
    translation: [0, 0],
    scale: [1, 1],
    pointer: [0, 0]
  }

  componentWillMount() {
    this.image = new Image()
    // image.src = require('./cat.jpg')
    this.image.src = require('./cat.png')
    this.image.onload = () => {
      const { width, height } = this.image
      this.setState({ image: [width, height ]})
    };
  }

  componentDidMount() {
    setTimeout(() => this.updateDimensions(), 100)
    window.addEventListener('resize', () => this.updateDimensions())
    setTimeout(() => this.forceUpdate(), 250)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateDimensions())    
  }

  updateContainer = (node: HTMLDivElement) => {
    this.container = node
  }

  updateDimensions = () => {
    if (!this.container) return
    const { width, height } = this.container.getBoundingClientRect()
    this.setState({ resolution: [width, height] })
  }

  onScale = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    this.setState({ scale: [value, value] })
  }

  onTranslate = (x: number, y: number) => {
    const { translation, scale } = this.state
    this.setState({ translation: [
      translation[0] + x / scale[0],
      translation[1] - y / scale[1]
    ] })
  }

  onRotate = (_degrees: number) => {
    // TODO
  }

  onCoordinates = (x: number, y: number) => {
    this.x = x
    this.y = -y
  }

  render() {
    const { resolution, image, translation, scale, pointer } = this.state

    const sampler = image[0] > 0 && image[1] > 0 && <ImageCanvas image={this.image} />

    return (
      <div className="WebGLCanvasPage" ref={this.updateContainer}>
        <div className="WebGLCanvasPage-Options">
          <input
            className="WebGLCanvasPage-Options-Slider"
            type="range"
            onChange={this.onScale}
            min={1}
            max={10}
            step={0.01}
            value={scale[0]}
          />
        </div>
        <Touch
          onTranslate={this.onTranslate}
          onRotate={this.onRotate}
          options={{ wheelMax: 1, minZoomLevel: -10 }}
        >
          {sampler && <Surface width={resolution[0]} height={resolution[1]}>
            <Node
            shader={shaders.image}
            uniforms={{
              u_sampler: sampler,
              u_resolution: resolution,
              u_translation: translation,
              u_scale: scale,
              u_image: image
            }}
          />
          </Surface>}
        </Touch>
      </div>
    );
  }
}
