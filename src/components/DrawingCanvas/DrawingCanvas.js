import React, { Component } from 'react'
var Pressure = require('pressure');
var Victor = require('victor')

const toRadians = angle => -(angle * Math.PI) / 180

const DISTANCE_BETWEEN_POINTS = 1

var history = {
  redo_list: [],
  undo_list: [],
  saveState: function(canvas, list, keep_redo) {
    keep_redo = keep_redo || false;
    if(!keep_redo) {
      this.redo_list = [];
    }
    
    (list || this.undo_list).push(canvas.toDataURL());   
  },
  undo: function(canvas, ctx) {
    this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
  },
  redo: function(canvas, ctx) {
    this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
  },
  restoreState: function(canvas, ctx,  pop, push) {
    if(pop.length) {
      this.saveState(canvas, push, true);
      var restore_state = pop.pop();
      var img = new Image();
      img.src = restore_state 
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);  
      }
    }
  }
}

class DrawingCanvas extends Component {
  constructor(props){
    super(props)
    this.state = {
      canvas: null,
      ctx: null,
      drawing: false,
      pressure: 0,
      brush: 'normal',
      lastPoint: null,
      mousePos: null
    }
  }

  async componentDidMount() {
    await this.getContext()
    const { canvas, ctx } = this.state
    document.addEventListener('keydown', function(event) {
      if (event.keyCode === 83) {
        history.undo(canvas, ctx)
      }
      if (event.keyCode === 87) {
        history.redo(canvas, ctx)
      }
    })
  }

  drawBrush(p){
    let { ctx, pressure } = this.state
    let canvasPosition = this.toCanvasCoord(p)
    let size = 5 + (pressure * 20)
    let base_image = new Image();
    base_image.src = 'brushsoft.png';
    base_image.onload = function(){
      ctx.msImageSmoothingEnabled = false;
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha=pressure;
      ctx.drawImage(base_image, canvasPosition.x - size/2, canvasPosition.y - size/2, size, size);
    }
  }

  async getContext() {
    const { canvas } = this.refs
    const ctx = canvas.getContext('2d')
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    this.setState({ canvas, ctx }, this.fillWhite)
    let component = this
    canvas.addEventListener('mousedown', this.start.bind(this))
    canvas.addEventListener('mousemove', this.stroke.bind(this))
    canvas.addEventListener('mouseout', this.stop.bind(this))
    canvas.addEventListener('mouseup', this.stop.bind(this))
    canvas.addEventListener('touchstart', this.start.bind(this))
    canvas.addEventListener('touchmove', this.stroke.bind(this))
    canvas.addEventListener('touchleave', this.stop.bind(this))
    canvas.addEventListener('touchend', this.stop.bind(this))
    canvas.addEventListener('touchcancel', this.stop.bind(this))
    Pressure.set('canvas', {
      change: function(force, event){
        let pressure = 0
        pressure = event.pointerType !== 'mouse' ? force : 1
        component.setState({ pressure })
      }
    });
  }

  start (evt) {
    if (evt.targetTouches && evt.targetTouches.length > 1) return
    const { canvas } = this.state
    const { canDraw } = this.props
    if (!canDraw) return
    let eventPoint = this.getEventRelativePosition(evt)
    let transformed = this.calculatePoint(eventPoint)
    console.log('Start:', transformed)
    this.drawBrush(transformed)
    history.saveState(canvas);
    this.setState({ drawing: true, lastPoint: transformed })
  }

  stroke (evt) {
    if (evt.targetTouches && evt.targetTouches.length > 1) return
    let { drawing, lastPoint } = this.state
    const { canDraw } = this.props
    if (!canDraw) return
    if (drawing) {
      let eventPoint = this.getEventRelativePosition(evt)
      let transformed = this.calculatePoint(eventPoint)
      let d = lastPoint.distance(transformed)
      let diff = transformed.clone().subtract(lastPoint)
      let a = diff.angle()
      let segment = new Victor(DISTANCE_BETWEEN_POINTS, 0).rotate(a)
      console.log('Last:', lastPoint)
      console.log('New:', transformed)
      console.log('Diff:', diff)
      console.log('Seg:', segment)
      console.log('Dist:', d)
      let times = d / DISTANCE_BETWEEN_POINTS
      let currentPos = lastPoint.clone()
      for (let i = 0 ; i < times ; i++) {
        this.drawBrush(currentPos.add(segment))
      }
      this.setState({ lastPoint: transformed, mousePos: new Victor(evt.clientX, evt.clientY) })
    }
  }

  toRelative (p) {
    const { canvas } = this.state
    return p.clone().subtract(new Victor(canvas.width/2, canvas.height/2))
  }

  toCanvasCoord (p) {
    const { canvas } = this.state
    return p.clone().multiply(new Victor(1, -1)).add(new Victor(canvas.width/2, canvas.height/2))
  }

  getEventRelativePosition (evt) {
    const { canvas } = this.state
    return new Victor( 
      evt.pageX - (canvas.getBoundingClientRect().x + (canvas.getBoundingClientRect().width / 2)),
      evt.pageY - (canvas.getBoundingClientRect().y + (canvas.getBoundingClientRect().height / 2))
    ).multiply(new Victor(1, -1))
  }

  transformPoint(p) {

  }

  calculatePoint(p){
    let rotated = this.rotatePoint(p)
    console.log('Before Scale:', rotated)
    let scaled = this.scalePoint(rotated)
    console.log('After Scale:', scaled)
    return scaled
  }

  rotatePoint(p) {
    let { rotation } = this.props
    return p.clone().rotateDeg(rotation)
  }

  scalePoint(p) {
    let { scale } = this.props
    return p.clone().divide(new Victor(scale, scale))
  }

  stop (evt) {
    this.setState({ drawing: false, lastPoint: null })
  }

  fillWhite() {
    const { ctx } = this.state
    var imgData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
    for (var i=0;i<imgData.data.length;i+=4)
      {
      imgData.data[i+0]=255
      imgData.data[i+1]=255
      imgData.data[i+2]=255
      imgData.data[i+3]=255
      }
    ctx.putImageData(imgData,0,0);
  }

  render() {
    let { pressure } = this.state
    return (
      <div>
        <div>{`Pressure: ${pressure.toFixed(2)}`}</div>
        <canvas ref="canvas" width={500} height={500} />
      </div>
    );
  }
}

export default DrawingCanvas;
