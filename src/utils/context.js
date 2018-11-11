import React from 'react'
import Victor from 'victor'
import Pressure from 'pressure'
import interact from 'interactjs'
import T, { ToolsArray } from './tools'
import { createCanvas } from './canvas'
import '../Absolute.css'

const DrawingContext = React.createContext()
const DISTANCE_BETWEEN_POINTS = 1

const DEFAULT_CANVAS_SIZE = new Victor(500, 500)
const ww = window.innerWidth
const wh = window.innerHeight

export function provide (Component) {
  return class extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        pressedKeys: new Array(255).fill(false),
        loading: true,
        canvas: null,
        transform: null,
        usingTool: false,
        pressure: 0,
        lastDrawingPoint: null,
        lastEventPoint: null,
        transformRefPoint: null,
        transformRef: null,
        tool: {
          selected: T.BRUSH,
          temporal: T.NONE
        }
      }
    }

    componentDidMount = () => {
      this.mapEvents()
      let canvas = createCanvas()
      this.setState({ canvas, loading: false }, this.setTransform())
    }

    loadLayer = (id, { ctx, element }) => {
      let { canvas } = this.state
      canvas.layers[id].ctx = ctx
      canvas.layers[id].element = element
      this.setState({ canvas }, this.evaluateCanvasReady)
    }

    evaluateCanvasReady = () => {
      let { canvas } = this.state
      let unready = canvas.layers.filter(e => e.ctx === null || e.canvasElement === null)
      if(unready.length === 0) {
        canvas.loading = false
        this.setState({ canvas })
      }
    }

    setTransform = () => {
      const { canvas } = this.state
      let canvasSize = canvas ? canvas.size : DEFAULT_CANVAS_SIZE
      let transform = {
        position: new Victor(ww, wh)
          .subtract(new Victor(canvasSize.x, canvasSize.y))
          .divide(new Victor(2, 2)),
        rotation: 0,
        scale: 1
      }
      this.setState({ transform })
    }

    mapEvents = () => {
      let component = this

      document.addEventListener('keydown', evt => component.keyDown(evt.keyCode))
      document.addEventListener('keyup', evt => component.keyUp(evt.keyCode))

      document.addEventListener('mousedown', evt => component.start(evt))
      document.addEventListener('mousemove', evt => component.move(evt))
      document.addEventListener('mouseleave', evt => component.stop(evt))
      document.addEventListener('mouseup', evt => component.stop(evt))

      document.addEventListener('contextmenu', event => event.preventDefault());

      Pressure.set('html', {
        change: function(force, event){
          let pressure = 0
          pressure = event.pointerType !== 'mouse' ? force : 1
          component.setState({ pressure })
        }
      })

      interact('html').draggable({
        // onmove: this.moveCanvas.bind(component)
      }).gesturable({
        // onstart: this.handleCanvasStart.bind(component),
        // onmove: this.handleCanvas.bind(component),
        // onend: this.handleCanvasEnd.bind(component)
      }).styleCursor(false)

    }

    drawBrush = p => {
      let { pressure } = this.state
      let dp = this.drawingPoint(p.clone())
      let ctx = this.getSelectedLayer().ctx
      let size = 5 + (pressure * 10) 
      let base_image = new Image();
      base_image.src = 'brushsoft.png';
      base_image.onload = function(){
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha=pressure;
        ctx.drawImage(base_image, dp.x - size/2, dp.y - size/2, size, size);
      }
      this.setState({ lastDrawingPoint: p })
    }

    relativeToCanvasCenter = (p, fixedY = true) => {
      let element = this.getSelectedLayer().element
      return p
        .subtract(new Victor( 
          element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2,
          element.getBoundingClientRect().y + element.getBoundingClientRect().height / 2
        ))
    }

    relativeToCanvasCenterInverted = p => {
      let element = this.getSelectedLayer().element
      return p
        .subtract(new Victor( 
          element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2,
          element.getBoundingClientRect().y + element.getBoundingClientRect().height / 2
        ))
        .multiply(new Victor(1, -1))
    }

    transformWithCanvas = p => {
      let { transform } = this.state
      return p
        .rotateDeg(transform.rotation)
        .divide(new Victor(transform.scale, transform.scale))
    }

    transformWithCanvasInverted = p => {
      let { transform } = this.state
      return p
        .rotateDeg(transform.rotation)
        .divide(new Victor(transform.scale, transform.scale))
        .multiply(new Victor(1, -1))
    }
    
    drawingPoint = p => {
      let element = this.getSelectedLayer().element
      return p.add(new Victor(element.width/2, element.height/2))
    }

    start = evt => {
      if (evt.targetTouches && evt.targetTouches.length > 1) return
      let eventPoint = new Victor(evt.pageX, evt.pageY)
      let canvasPoint
      switch (this.getCurrentTool()) {
        case T.BRUSH:
          canvasPoint = this.relativeToCanvasCenterInverted(eventPoint.clone())
          let transformedPoint = this.transformWithCanvasInverted(canvasPoint)
          this.drawBrush(transformedPoint)
          this.setState({ transformRefPoint: canvasPoint })
          break;
        case T.ROTATION:
          const { transform } = this.state
          canvasPoint = this.relativeToCanvasCenterInverted(eventPoint.clone())
          let transformRef = { rotation: transform.rotation }
          this.setState({ transformRefPoint: canvasPoint, transformRef })
          break;
        case T.HAND:
          break;
        case T.ZOOM_IN:
          canvasPoint = this.relativeToCanvasCenter(eventPoint.clone())
          this.zoom(canvasPoint, 0.3)
          break;
        case T.ZOOM_OUT:
          canvasPoint = this.relativeToCanvasCenter(eventPoint.clone())
          this.zoom(canvasPoint, -0.3)
          break;
        default:
          break;
      }
      this.setState({ lastEventPoint: eventPoint, usingTool: true })
    }
    
    move = evt => {
      let { usingTool, lastDrawingPoint } = this.state
      if (usingTool) {
        let eventPoint = new Victor(evt.pageX, evt.pageY)
        switch (this.getCurrentTool()) {
          case T.BRUSH:
            let currentDrawingPoint = this.relativeToCanvasCenterInverted(eventPoint.clone())
            this.transformWithCanvasInverted(currentDrawingPoint)
            let d = lastDrawingPoint.distance(currentDrawingPoint)
            let diff = currentDrawingPoint.clone().subtract(lastDrawingPoint)
            let a = diff.angle()
            let segment = new Victor(DISTANCE_BETWEEN_POINTS, 0).rotate(a)
            let times = d / DISTANCE_BETWEEN_POINTS
            let current = lastDrawingPoint.clone()
            for (let i = 0 ; i < times ; i++) {
              this.drawBrush(current.add(segment))
            }
            break;
          case T.HAND:
            this.moveCanvas(evt)
            break;
          case T.ROTATION:
            this.rotateCanvas(eventPoint)
            break;
          default:
            break;
          }
        this.setState({ lastEventPoint: eventPoint })
      }
    }

    stop = evt => {
      this.setState({ usingTool: false })
    }



    moveCanvas = evt => {
      const { transform, lastEventPoint } = this.state
      let delta = new Victor(evt.pageX, evt.pageY).subtract(lastEventPoint)
      transform.position.add(delta)
      this.setState({ transform })
    }

    rotateCanvas = p => {
      const { transform, transformRefPoint, transformRef } = this.state
      let currentAngle = this.relativeToCanvasCenterInverted(p).angleDeg()
      let originalAngle = transformRefPoint.angleDeg()
      transform.rotation = transformRef.rotation + (originalAngle - currentAngle)
      this.setState({ transform })
    }

    zoom = (p, amount) => {
      const { transform } = this.state
      transform.scale += amount
      let multiplier = Math.abs(transform.scale)
      if(amount > 0) transform.position.subtract(p).divide(new Victor(multiplier, multiplier))
      if(amount < 0) transform.position.add(p).divide(new Victor(multiplier, multiplier))
      this.setState({ transform })
    }

    getSelectedLayer = () => {
      const { canvas } = this.state
      return canvas.layers[canvas.activeLayer]
    }

    adjustToCanvasTransform = p => {
      const { canvas: { transform } } = this.state
      return p.clone().rotateDeg(transform.rotation).divide(new Victor(transform.scale, transform.scale))
    }
    
    keyDown = keyCode => {
      let { pressedKeys } = this.state
      pressedKeys[keyCode] = true
      this.setState({ pressedKeys }, () => {
        this.evaluateSelectedTool(keyCode)
        this.evaluateTemporalTool()
      })
    }

    keyUp = keyCode => {
      let { pressedKeys } = this.state
      pressedKeys[keyCode] = false
      this.setState({ pressedKeys }, () => {
        this.evaluateTemporalTool()
      })
    }

    evaluateSelectedTool = keyCode => {
      ToolsArray.map(e => {
        if (e.key === keyCode) this.selectTool(e)
      })
    }

    evaluateTemporalTool = () => {
      let { pressedKeys, tool } = this.state
      tool.temporal = T.NONE
      let qualifiedTools = ToolsArray.filter(e => e.tmp_key !== null)
      qualifiedTools.sort((a, b) => a.tmp_key.length - b.tmp_key.length)
      qualifiedTools.map(e => {
        let test = e.tmp_key.map(k => pressedKeys[k])
        let pass = !test.includes(false)
        if (pass) tool.temporal = e
      })
      this.setState({ tool })
    }

    selectTool = newTool => {
      let { tool } = this.state
      tool.selected = newTool
      this.setState({ tool })
    }

    isKeyDown = keyCode => this.state.pressedKeys[keyCode]

    getCurrentTool = () => {
      const { tool } = this.state
      return tool.temporal === T.NONE
        ? tool.selected
        : tool.temporal
    }

    render () {
      const drawingState = this.state
      const drawingMethods = { 
        loadLayer: this.loadLayer.bind(this),
        getCurrentTool: this.getCurrentTool.bind(this)  
      }
      let displayCursor = this.getCurrentTool().default_cursor
      if (drawingState.loading) {
        return <div> Loading... </div>
      } else {
        return (
          <DrawingContext.Provider value={{ drawingState, drawingMethods }}>
            <Component {...this.props} />
            <style jsx global>{`
              html {
                cursor: ${displayCursor};
                image-rendering: pixelated;
              }
            `}</style>
          </DrawingContext.Provider>
        )
      }
    }
  }
}

export function consume (Component) {
  return class extends React.Component { 
    render () {
      return (
        <DrawingContext.Consumer>
          {
            context => <Component {...context} {...this.props} />
          }
        </DrawingContext.Consumer>
      )
    }
  }
}