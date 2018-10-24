# react-touch-zoom-pan-canvas

This is a set of two React higher order components, for hooking mouse and touch events panning/zooming functionality into your application.

The project doesn't have dependencies to any other libraries than React (and TypeScript types for React).

See the project on GitHub: https://github.com/jussikinnula/react-touch-zoom-pan-canvas

## Installation

```bash
$ npm install --save react-touch-zoom-pan-canvas
```

## Usage

### Example

Here's a very minimal version, which writes the seconds after animation started to the canvas.

```tsx
import * as React from 'react'
import { Touch, Canvas } from 'react-touch-zoom-pan-canvas'

export default class App extends React.Component {
  ctx: CanvasRenderingContext2D = null

  onAnimationFrame = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.font = '30px Arial'
    ctx.fillText(`time: ${Math.round(time)}`, 25, 50)
  }

  render() {
    const style = { width: '800px', border: '1px solid red' }
    return (
      <div style={style}>
        <Touch
          onScale={(x: number, y: number) => this.ctx.scale(x, y)}
          onTranslate={(x: number, y: number) => this.ctx.translate(x, y)}
        >
          <Canvas
            width={800}
            height={600}
            onAnimationFrame={this.onAnimationFrame}
            getContext={(ctx: CanvasRenderingContext2D) => this.ctx = ctx}
          />
        </Touch>
      </div>
    );
  }
}
```

### Touch -component

All parameters are optional, `onTranslate` and `onScale` are recommended to be used - so that Canvas context scaling and translation matrix is synced. All raw events are untouched - either `React.MouseEvent<HTMLDivElement>` or `React.TouchEvent<HTMLDivElement>`.

```tsx
<Touch
  scaleFactor={1.1} // set the scale factor (default 1.1) for zooming
  wheelMax={5} // maximum wheel zoom amount (default 5)
  touchSensitivity={5} // touch sensitivity (default 5)
  onPanStart={(event) => { ... }} // raw events, when panning starts
  onPan={(event) => { ... }} // raw events, when panning is active (e.g. touch or mouse moves)
  onPanEnd={(event) => { ... }} // raw events, when panning ends
  onPinchStart={(event) => { ... }} // raw events, when pinch zoom starts
  onPinch={(event) => { ... }} // raw events, when pinch zooming is active (e.g. pinch gesture between two touch points is happening)
  onPinchEnd={(event) => { ... }} // raw events, when pinch zoom ends
  onZoom={(event) => { ... }} // raw events, when zooming (either with pinch, mouse wheel or mouse click)
  onTranslate={(x: number, y: number) => { ... }) // set Canvas translation matrix (e.g. ctx.translate(x, y))
  onScale={(x: number, y: number) => { ... }) // set Canvas scale (e.g. ctx.scale(x, y))
>
  ...
</Touch>
```

Note! Parameters `wheelMax` and `touchSensitivity` are device and operating system specific. So you need to test with real devices. If you want, you could share good values with this project so we could have good defaults in future.

### Canvas -component

The callbacks' `ctx` is `CanvasRenderingContext2D`, and time is a number (starting where the animation started).

```tsx
<Canvas
  width={800} // Set width for the canvas
  height={600} // Set height for the canvas
  onAnimationFrame={(ctx, time) => { ... }} // draw anything to Canvas 2D context here (uses requestAnimationFrame to trigger redraw)
  getContext={(ctx) => { ... }} // get Canvas 2D context (this should be linked by Touch -component, to set scale and translate)
/>
```

## Development

### Utilities

The `utils` -library used internally by Touch and Canvas -components is used to do matrix and distance calculations. You can look the inner workings also from 

### Remote Logging

In order to test with real touch -capable devices, you can use remote logging (e.g. get device console.log's into your console), with the following environment variables:

```bash
$ REMOTE_LOG=http://x.x.x.x:12345 npm start
```

Note! Replace `x.x.x.x` with your computer's IP address, accessible from your touch device.

Start remote log in separate shell:

```bash
$ npm run remote-log
```

