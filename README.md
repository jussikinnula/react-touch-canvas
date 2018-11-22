# react-touch-canvas

This is a set of two React higher order components, for hooking mouse and touch events panning/zooming functionality into your application.

The project doesn't have dependencies to any other libraries than React (and TypeScript types for React).

Project home page: [https://jussikinnula.github.io/react-touch-canvas](https://jussikinnula.github.io/react-touch-canvas)

See the project on GitHub: [https://github.com/jussikinnula/react-touch-canvas](https://github.com/jussikinnula/react-touch-canvas)

## Installation

```bash
$ npm install --save react-touch-canvas
```

## Usage

### Example

You can check an example application, which sets canvas full screen and also updates the canvas size on resize, and other fancy things:

Live version: [https://jussikinnula.github.io/react-touch-canvas/example](https://jussikinnula.github.io/react-touch-canvas/example)

Source: [https://github.com/jussikinnula/react-touch-canvas/tree/master/example/src](https://github.com/jussikinnula/react-touch-canvas/tree/master/example/src)

### Minimal example

Here's a very minimal version, which writes the seconds after animation started to the canvas.

```tsx
import * as React from 'react'
import { Touch, Canvas } from 'react-touch-canvas'

const style = { width: '800px', border: '1px solid red' }

export default const App = () => (
  <div style={style}>
    <Touch>
      <Canvas
        width={800}
        height={600}
        onAnimationFrame={(ctx, time) => {
          ctx.font = '30px Arial'
          ctx.fillText(`time: ${Math.round(time)}`, 25, 50)
        }}
      />
    </Touch>
  </div>
)
```

### Touch -component

All parameters are optional.

Parameters `wheelMax` and `touchSensitivity` are device and operating system specific. So you need to test with real devices. If you want, you could share good values with this project so we could have good defaults in future.

If you are hooking to an external Canvas, you want to set context based on `onTranslate` and `onScale` values (the coordinates are relative). The `onReset` is called on resize, when matrix is reset.

Panning and pinching raw events are untouched (can be either `React.MouseEvent<HTMLDivElement>` or `React.TouchEvent<HTMLDivElement>`).

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
  onTranslate={(x: number, y: number) => { ... }) // raw coordinates, when matrix is translated
  onScale={(x: number, y: number) => { ... }) // raw coordinates, when matrix is scaled
  onReset={() => { ... }} // called when matrix is reset
>
  ...
</Touch>
```

### Canvas -component

The `ctx` in `onAnimationFrame` and `getContext` callbacks is `CanvasRenderingContext2D`, and time is a number (starting where the animation started).

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

The `utils` -library used internally by Touch and Canvas -components is used to do matrix and distance calculations. You can look the inner workings also from the source.

### Remote Logging

In order to test with real touch -capable devices, you can use remote logging (e.g. get device console.log's into your console), with the following environment variables:

```bash
$ REMOTE_LOG=ws://x.x.x.x:12345 npm start
```

Note! Replace `x.x.x.x` with your computer's IP address, accessible from your touch device.

Start remote log in separate shell:

```bash
$ npm run remote-log
```

