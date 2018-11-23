declare module 'gl-react-dom' {
  import * as React from 'react'
  import * as glReact from 'gl-react';

  type SupportedImage = 'image/png' | 'image/jpeg' | 'image/bmp' | 'image/webp' | 'image/ico';
  type ValidQuality = 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;

  interface GLViewDOMProps {
    onContextCreate?: (gl: WebGLRenderingContext) => void;
    onContextFailure?: (e: Error) => void;
    onContextLost?: () => void;
    onContextRestored?: (gl: WebGLRenderingContext) => void;
    webglContextAttributes?: WebGLContextAttributes;
    pixelRatio?: number;
    width: number;
    height: number;
    style?: any;
    debug?: number;
  }

  interface GLViewDOMState {
    error: Error;
  }

  class GLViewDOM extends React.Component<GLViewDOMProps, GLViewDOMState> {
    onRef: (ref: HTMLCanvasElement) => void;
    debugError?: (error: Error) => void;
    afterDraw?: () => void;
    captureAsDataURL(type?: SupportedImage, quality?: ValidQuality): string;
    captureAsBlob(callback: (data: Blob) => void, type?: SupportedImage, quality?: ValidQuality): Promise<Blob>;
    webglContextAttributes: WebGLContextAttributes;
    canvas?: HTMLCanvasElement;
    gl?: WebGLRenderingContext;
  }

  export interface SurfaceProps extends glReact.SurfaceProps, GLViewDOMProps {}

  export class Surface extends glReact.Surface<GLViewDOM> {
    props: SurfaceProps;
  }
}