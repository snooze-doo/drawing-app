import Victor from 'victor'


export function createCanvas(w = 500, h = 500) {
  return {
    size: new Victor(w, h),
    layers: [ {
      id: 0,
      ctx: null,
      element: null,
      children: []
    },
    {
      id: 1,
      ctx: null,
      element: null,
      children: []
    },
    {
      id: 2,
      ctx: null,
      element: null,
      children: []
    },
    {
      id: 3,
      ctx: null,
      element: null,
      children: []
    }],
    activeLayer: 0,
    loading: true
  }
}