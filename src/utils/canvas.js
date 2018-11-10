import Victor from 'victor'

const ww = window.innerWidth
const wh = window.innerHeight

export function createCanvas(w = 500, h = 500) {
  return {
    transform: {
      position: new Victor(ww, wh)
        .subtract(new Victor(w, h))
        .divide(new Victor(2, 2)),
      size: new Victor(w, h),
      rotation: 0,
      scale: 1
    },
    layers: [ {
      id: 0,
      ctx: null,
      canvasElement: null,
      children: []
    },
    {
      id: 1,
      ctx: null,
      canvasElement: null,
      children: []
    },
    {
      id: 2,
      ctx: null,
      canvasElement: null,
      children: []
    },
    {
      id: 3,
      ctx: null,
      canvasElement: null,
      children: []
    }],
    activeLayer: 0,
    loading: true
  }
}