import React from 'react'
import Victor from 'victor'
import Pressure from 'pressure'
import interact from 'interactjs'
import T, { ToolsArray } from './tools'
import { createCanvas } from './canvas'
import '../Absolute.css'

const DrawingContext = React.createContext()
const DISTANCE_BETWEEN_POINTS = 4

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
      let size = 5 + (pressure * 20) 
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

    relativeToCanvasCenter = (p) => {
      let { transform } = this.state
      let element = this.getSelectedLayer().element
      return p
        .subtract(new Victor( 
          element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2,
          element.getBoundingClientRect().y + element.getBoundingClientRect().height / 2
        ))
        .rotateDeg(transform.rotation)
        .divide(new Victor(transform.scale, transform.scale))
    }
    
    drawingPoint = p => {
      let element = this.getSelectedLayer().element
      return p.add(new Victor(element.width/2, element.height/2))
    }

    start = evt => {
      if (evt.targetTouches && evt.targetTouches.length > 1) return
      let eventPoint = new Victor(evt.pageX, evt.pageY)
      switch (this.getCurrentTool()) {
        case T.BRUSH:
          let canvasPoint = this.relativeToCanvasCenter(eventPoint.clone())
          console.log(canvasPoint)
          this.drawBrush(canvasPoint)
        case T.HAND:
        case T.ROTATION:
          this.setState({ usingTool: true })
          break;
        case T.ZOOM_IN:
          this.zoom(canvasPoint, 0.3)
          break;
        case T.ZOOM_OUT:
          this.zoom(canvasPoint, -0.3)
          break;
        default:
          break;
      }
      this.setState({ lastEventPoint: eventPoint })
    }
    
    move = evt => {
      let { usingTool, lastDrawingPoint } = this.state
      if (usingTool) {
        let eventPoint = new Victor(evt.pageX, evt.pageY)
        switch (this.getCurrentTool()) {
          case T.BRUSH:
            let currentDrawingPoint = this.relativeToCanvasCenter(eventPoint.clone())
            let d = lastDrawingPoint.distance(currentDrawingPoint)
            let diff = currentDrawingPoint.clone().subtract(lastDrawingPoint)
            let a = diff.angle()
            let segment = new Victor(DISTANCE_BETWEEN_POINTS, 0).rotate(a)
            let times = d / DISTANCE_BETWEEN_POINTS
            let current = lastDrawingPoint.clone()
            console.log('Last:', lastDrawingPoint)
            console.log('New:', currentDrawingPoint)
            console.log('Diff:', diff)
            console.log('Seg:', segment)
            console.log('Dist:', d)
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
      const { canvas, lastPos } = this.state
      let delta = new Victor(evt.pageX, evt.pageY).subtract(lastPos)
      canvas.transform.position.add(delta)
      this.setState({ canvas })
    }

    rotateCanvas = p => {
      const { canvas, lastPos } = this.state
      let relativeLastPosAngle = this.relativeToCanvasCenter(lastPos).angleDeg()
      let currentPosAngle = p.angleDeg()
      canvas.transform.rotation -= (currentPosAngle - relativeLastPosAngle)
      this.setState({ canvas })
    }

    zoom = (p, amount) => {
      const { canvas } = this.state
      canvas.transform.scale += amount
      this.setState({ canvas })
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