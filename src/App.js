import React, { Component } from 'react';
import DrawingCanvas from './components/DrawingCanvas/DrawingCanvas'
import interact from 'interactjs'
import { provide, consume } from "./utils/context";

import './App.css';

const cursor_tools = {
  none: 'default',
  cursor: 'default',
  move: 'move',
  brush: 'crosshair'
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tool: 'cursor',
      tmp_tool: 'none',
      cursor_style: 'default',
      x: (window.innerWidth - 500) / 2,
      y: (window.innerHeight - 500) / 2,
      scale: 1,
      rotation: 0,
      fullscreen: false,
      canDraw: true
    }
  }

  componentDidMount () {
    const component = this
    document.addEventListener('keydown', function(event) {
      console.log(`Keydown: ${event.which}`);
      if (event.keyCode === 32) {
        component.setState({ tmp_tool: 'move' }, component.reloadCursorStyle)
      }
      if (event.keyCode === 66) {
        component.setState({ tool: 'brush' }, component.reloadCursorStyle)
      }
      if (event.keyCode === 86) {
        component.setState({ tool: 'cursor' }, component.reloadCursorStyle)
      }
      if (event.keyCode === 69) {
        component.rotate(5)
      }
      if (event.keyCode === 81) {
        component.rotate(-5)
      }
      if (event.keyCode === 68) {
        component.scale(0.1)
      }
      if (event.keyCode === 65) {
        component.scale(-0.1)
      }
    })
    document.addEventListener('keyup', function(event) {
      console.log(`Keyup: ${event.which}`);
      if (event.keyCode === 32) {
        component.setState({ tmp_tool: 'none' }, component.reloadCursorStyle)
      }
    })
    interact('.entire-canvas').draggable({
      onmove: this.moveCanvas.bind(component)
    }).gesturable({
      onstart: this.handleCanvasStart.bind(component),
      onmove: this.handleCanvas.bind(component),
      onend: this.handleCanvasEnd.bind(component)
    }).styleCursor(false)
  }

  rotate (angle) {
    let { rotation } = this.state
    rotation += angle
    this.setState({ rotation })
  }

  scale (amount) {
    let { scale } = this.state
    scale += amount
    this.setState({ scale })
  }

  handleCanvasStart (event) {
    this.setState({ canDraw: false })
  }

  handleCanvasEnd (event) {
    this.setState({ canDraw: true })
  }

  handleCanvas (event) {
    let { scale, rotation, x, y } = this.state
    scale *= (1 + event.ds)
    rotation += event.da
    x += event.dx / 2
    y += event.dy / 2
    this.setState({ scale, rotation, x, y })
  }

  moveCanvas (event) {
    if (this.getCurrentTool() !== 'move') return
    const { x, y } = this.state
    this.setState({ x: x + event.dx,
      y: y + event.dy})
  }

  transformToCss (transform) {
    return `
      translate(${transform.position.x}px,
      ${transform.position.y}px)
      rotate(${transform.rotation}deg)
      scale(${transform.scale})
    `
  }

  getCurrentTool () {
    const { tool, tmp_tool } = this.state
    return tmp_tool === 'none' ? tool : tmp_tool
  }

  reloadCursorStyle () {
    this.setState({ cursor_style: cursor_tools[this.getCurrentTool()] })
  }

  toggleFullscreen() {
    const { fullscreen } = this.state
    const { app } = this.refs
    if (!fullscreen) {
      if (app.requestFullscreen) {
        app.requestFullscreen();
      } else if (app.mozRequestFullScreen) { /* Firefox */
        app.mozRequestFullScreen();
      } else if (app.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        app.webkitRequestFullscreen();
      } else if (app.msRequestFullscreen) { /* IE/Edge */
        app.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    }
    this.setState({fullscreen : !fullscreen})
  }

  render() {
    const { x, y, cursor_style, rotation, scale, canDraw } = this.state
    return (
      <div ref="app" className="app">
        <div className="cursor-info">{`TOOL: ${this.getCurrentTool()}`}</div>
        <div className="rotation-info">{`ROTATION: ${rotation}`}</div>
        <div className="scale-info">{`SCALE: ${scale}`}</div>
        <div className="candraw-info">{`DRAWING: ${canDraw}`}</div>
        <div className="entire-canvas" style={{cursor: cursor_style}} >
          <div className="canvas-wrapper" style={{transform: `
              translate(${x}px,
              ${y}px)
              rotate(${rotation}deg)
              scale(${scale})
            `, transition: '0.1s ease-out'}}>
            <DrawingCanvas rotation={rotation} scale={scale} canDraw={canDraw} />
          </div>
        </div>
        <div className="fullscreen-toggle" onClick={this.toggleFullscreen.bind(this)}>toggle fullscreen</div>
      </div>
    );
  }
}

export default provide(consume(App))
