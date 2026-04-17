import * as L from 'leaflet'

declare module 'leaflet' {
  interface CurveOptions extends PathOptions {
    animate?: boolean | { duration: number; iterations: number }
  }

  interface Curve extends Path {
    options: CurveOptions
    setPath(path: Array<string | number[]>): this
    getPath(): Array<string | number[]>
  }

  function curve(path: Array<string | number[]>, options?: CurveOptions): Curve
}

declare module 'leaflet-curve' {
  export = L
}
