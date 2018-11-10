import React from 'react'
import T, { ToolsArray } from './tools'
import { createCanvas } from './canvas'

const DrawingContext = React.createContext();

export function provide (Component) {
  return class extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        pressedKeys: new Array(255).fill(false),
        loading: true,
        canvas: null,
        tool: {
          selected: T.CURSOR,
          temporal: T.NONE
        }
      }
    }

    componentDidMount = () => {
      this.mapEvents()
      let canvas = createCanvas()
      this.setState({ canvas, loading: false })
    }

    loadLayer = (id, { ctx, canvas }) => {
      let { canvas: stateCanvas } = this.state
      stateCanvas.layers[id].ctx = ctx
      stateCanvas.layers[id].canvasElement = canvas
      this.setState({ canvas: stateCanvas }, this.evaluateCanvasReady)
    }

    evaluateCanvasReady = () => {
      let { canvas } = this.state
      let unready = canvas.layers.filter(e => e.ctx === null || e.canvasElement === null)
      if(unready.length === 0) {
        canvas.loading = false
        this.setState({ canvas })
      }
    }

    mapEvents = () => {
      let component = this
      document.addEventListener('keydown', evt => component.keyDown(evt.keyCode))
      document.addEventListener('keyup', evt => component.keyUp(evt.keyCode))
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
      if (drawingState.loading) {
        return <div> Loading... </div>
      } else {
        return (
          <DrawingContext.Provider value={{ drawingState, drawingMethods }}>
            <Component {...this.props} />
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